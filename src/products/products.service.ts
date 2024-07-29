import { PrismaClient } from '@prisma/client';
import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalRecords = await this.product.count({where: {available: true}});
    const lastPage = Math.ceil(totalRecords / limit);
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: {
        total: totalRecords,
        page: page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id: id,
        available: true
      }
    })
    if(!product) {
      throw new RpcException({
        status: 404,
        message: `Product with id ${id} not found`
      })
      // throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data} = updateProductDto;
    await this.findOne(id);
    return this.product.update({
      where: {id: id},
      data: data
    })
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: {id: id},
      data: {
        available: false
      }
    }) 
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    if(products.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Some products were not found`
      })
    }
    return products;
  }
}
