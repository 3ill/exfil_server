import { BadRequestException, Injectable } from '@nestjs/common';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { DERIVATION_PATH } from '../constants/constants';
import { Keypair } from '@stellar/stellar-sdk';

@Injectable()
export class DeriveSecret {
  async derivePiSecretFromMnemonic(passphrase: string) {
    if (!bip39.validateMnemonic(passphrase)) {
      throw new BadRequestException('Invalid passphrase');
    }

    const seed = await bip39.mnemonicToSeed(passphrase);
    const { key } = derivePath(DERIVATION_PATH, seed.toString('hex'));
    return Keypair.fromRawEd25519Seed(key);
  }
}
