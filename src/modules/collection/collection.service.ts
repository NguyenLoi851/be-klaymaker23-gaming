import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IPaginationOptions } from "nestjs-typeorm-paginate";
import { PaginationResponse } from "src/config/rest/paginationResponse";
import { Collection } from "src/database/entities";
import { getArrayPagination } from "src/shared/Utils";
import { Raw, Repository } from "typeorm";
import { CollectionType } from "./request/type.dto";

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>
  ) {}

  async createCollection(collection: any): Promise<any> {
    const newCollection = this.collectionsRepository.create(collection);
    const savedCollection = await this.collectionsRepository.save(
      newCollection
    );
    return savedCollection;
  }

  async findAll(): Promise<Collection[]> {
    return await this.collectionsRepository.find();
  }

  async findOne(id: number): Promise<Collection | undefined> {
    return await this.collectionsRepository.findOne(id);
  }

  async update(
    id: number,
    collection: Collection
  ): Promise<Collection | undefined> {
    const existingCollection = await this.collectionsRepository.findOne(id);
    if (!existingCollection) {
      return undefined;
    }

    existingCollection.name = collection.name;
    await this.collectionsRepository.save(existingCollection);
    return existingCollection;
  }

  async delete(id: number): Promise<boolean> {
    const existingCollection = await this.collectionsRepository.findOne(id);
    if (!existingCollection) {
      return false;
    }

    await this.collectionsRepository.delete(existingCollection);
    return true;
  }

  async getAllCollection(
    creator: string,
    type: CollectionType,
    paginationOptions: IPaginationOptions
  ): Promise<PaginationResponse<Collection>> {
    var dataWhere = this.setParam(creator, type);

    const collections = await this.collectionsRepository.find({
      order: {
        updatedAt: "DESC",
      },
      where: dataWhere,
    });

    const { items, meta } = getArrayPagination<Collection>(
      collections,
      paginationOptions
    );

    return {
      results: items,
      pagination: meta,
    };
  }

  setParam(creator: string, type: CollectionType) {
    var dataWhere = {};

    if (type) {
      dataWhere["type"] = type;
    }

    if (creator) {
      dataWhere["creator"] = creator;
    }

    return dataWhere;
  }
}
