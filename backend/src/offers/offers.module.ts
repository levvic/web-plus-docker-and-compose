import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { WishesModule } from 'src/wishes/wishes.module';

@Module({
  providers: [OffersService],
  controllers: [OffersController],
  imports: [TypeOrmModule.forFeature([Offer]), WishesModule],
})
export class OffersModule {}
