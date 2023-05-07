import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WishInterceptor } from 'src/utils/interceptors/wish-interceptor';

@UseGuards(JwtGuard)
@UseGuards(ThrottlerGuard)
@UseInterceptors(WishInterceptor)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async getWishlists(): Promise<Wishlist[]> {
    return await this.wishlistsService.findAll();
  }

  @Post()
  async createWishlist(
    @Req() { user }: { user: User },
    @Body() dto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.create(dto, user);
  }

  @Get(':id')
  async getWishlistById(@Param('id') wishId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistsService.findById(Number(wishId));
    return wishlist;
  }

  @Patch(':id')
  async updateWishlist(
    @Req() { user }: { user: User },
    @Param('id') wishId: string,
    @Body() dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return await this.wishlistsService.update(Number(wishId), dto, user.id);
  }

  @Delete(':id')
  async deleteWishlist(
    @Req() { user }: { user: User },
    @Param('id') id: number,
  ): Promise<Wishlist> {
    return await this.wishlistsService.deleteById(id, user.id);
  }
}
