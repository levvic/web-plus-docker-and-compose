import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { OFFERED_AMOUNT_EXCEEDS_REQUIRED_PRICE } from 'src/utils/constants/wish';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(dto: CreateOfferDto, user: User) {
    const wish = await this.wishesService.findById(dto.itemId);
    // check if wish exists
    if (!wish) {
      throw new NotFoundException();
    }

    // user can't pay for his own wishes
    if (wish.owner.id === user.id) {
      throw new BadRequestException();
    }

    const totalSum = wish.raised + dto.amount;
    // user can't offer a higher amount than total price of the wish
    if (totalSum > wish.price) {
      throw new BadRequestException(OFFERED_AMOUNT_EXCEEDS_REQUIRED_PRICE);
    }

    await this.wishesService.updateRaisedAmount(wish.id, totalSum);

    // create offer
    const createdOffer = await this.offerRepository.create({
      ...dto,
      user,
      item: wish,
    });

    await this.offerRepository.save(createdOffer);
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ['item', 'user'],
    });
  }

  async findById(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['item', 'user'],
    });

    if (!offer) {
      throw new NotFoundException();
    }

    const { password, ...result } = offer.user;
    return offer;
  }
}
