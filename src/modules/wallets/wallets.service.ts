import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(createWalletDto: CreateWalletDto, userId: string): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      ...createWalletDto,
      userId,
    });
    return await this.walletsRepository.save(wallet);
  }

  async findAll(userId: string): Promise<Wallet[]> {
    return await this.walletsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this wallet');
    }

    return wallet;
  }

  async update(id: string, updateWalletDto: UpdateWalletDto, userId: string): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    
    const updatedWallet = Object.assign(wallet, updateWalletDto);
    return await this.walletsRepository.save(updatedWallet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const wallet = await this.findOne(id, userId);
    await this.walletsRepository.remove(wallet);
  }
}