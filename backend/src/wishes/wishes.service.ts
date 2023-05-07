import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { In, Repository } from 'typeorm';
import { WISH_COPY_FROM_SAME_OWNER } from 'src/utils/constants/wish';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User) {
    const wish = await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
    return wish;
  }

  async getLastWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'desc' },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishes',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
  }

  async getTopWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 20,
      order: { copied: 'desc' },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishes',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });
  }

  async findById(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishes',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });

    if (!wish) {
      throw new NotFoundException();
    }

    return wish;
  }

  async updateWish(wishId: number, userId: number, dto: UpdateWishDto) {
    const wish = await this.findById(wishId);

    if (!wish) {
      throw new NotFoundException();
    }

    // нельзя изменять стоимость, если уже есть желающие скинуться
    if (wish.raised > 0) {
      throw new BadRequestException();
    }

    // нельзя изменять чужие «хотелки»
    if (wish.owner.id !== userId) {
      throw new BadRequestException();
    }

    await this.wishRepository.update(wishId, dto);
  }

  async deleteById(wishId: number, userId: number): Promise<Wish> {
    const wish = await this.findById(wishId);
    if (!wish) {
      throw new NotFoundException();
    }
    // нельзя удалять чужие «хотелки»
    if (wish.owner.id !== userId) {
      throw new BadRequestException();
    }

    await this.wishRepository.delete(wishId);

    return wish;
  }

  async copyWish(wishId: number, user: User) {
    const wish = await this.wishRepository.findOneBy({ id: wishId });

    if (!wish) {
      throw new NotFoundException();
    }

    // нельзя скопировать собственный подарок
    if (wish.owner.id == user.id) {
      throw new BadRequestException(WISH_COPY_FROM_SAME_OWNER);
    }

    await this.wishRepository.update(wishId, {
      copied: (wish.copied += 1),
    });

    delete wish.id;
    delete wish.createdAt;
    delete wish.updatedAt;

    const wishCopy = {
      ...wish,
      owner: user,
      copied: 0,
      raised: 0,
      offers: [],
    };

    await this.create(wishCopy, user);
  }

  async findManyById(ids: number[]): Promise<Wish[]> {
    return this.wishRepository.find({
      where: { id: In(ids) },
    });
  }

  async updateRaisedAmount(wishId: number, raised: number) {
    await this.wishRepository.update(wishId, { raised });
  }
}
