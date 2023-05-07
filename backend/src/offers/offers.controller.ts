import {
  Controller,
  Get,
  UseGuards,
  Param,
  Body,
  Req,
  Post,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(JwtGuard)
@UseGuards(ThrottlerGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async getAllOffers(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOffersById(@Param('id') id: string): Promise<Offer> {
    return await this.offersService.findById(Number(id));
  }

  @Post()
  async createOffer(
    @Body() dto: CreateOfferDto,
    @Req() { user }: { user: User },
  ) {
    return await this.offersService.create(dto, user);
  }
}
