import { Module } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [WishesService],
  controllers: [WishesController],
  imports: [TypeOrmModule.forFeature([Wish]), WishesModule],
  exports: [WishesService],
})
export class WishesModule {}
