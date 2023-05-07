import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(dto: CreateWishlistDto, user: User): Promise<Wishlist> {
    const wishes = await this.wishesService.findManyById(dto.itemsId);

    await this.wishlistRepository.save({
      ...dto,
      owner: user,
      items: wishes,
    });

    return await this.wishlistRepository.findOne({
      where: { name: dto.name, owner: user },
      relations: ['owner', 'items'],
    });
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException();
    }

    return wishlist;
  }

  async update(
    id: number,
    dto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findById(id);

    if (!wishlist) {
      throw new NotFoundException();
    }

    if (wishlist.owner.id !== userId) {
      throw new BadRequestException();
    }

    const wishes = await this.wishesService.findManyById(dto.itemsId || []);

    return await this.wishlistRepository.save({
      ...wishlist,
      name: dto.name,
      image: dto.image,
      description: dto.description,
      items: wishes,
    });
  }

  async deleteById(id: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.findById(id);

    if (!wishlist) {
      throw new NotFoundException();
    }

    if (wishlist.owner.id !== userId) {
      throw new BadRequestException();
    }

    await this.wishlistRepository.delete(id);

    return wishlist;
  }
}
