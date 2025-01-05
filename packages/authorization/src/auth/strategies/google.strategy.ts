import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, GoogleProfile, OAuthPayload } from '@/common/types';
import { Inject } from '@nestjs/common';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject() cfgService: ConfigService<EnvConfig>) {
    super({
      clientID: cfgService.get('GOOGLE_CLIENT_ID'),
      clientSecret: cfgService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: cfgService.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ) {
    const { name, email, picture } = profile;

    const user: OAuthPayload = {
      email: email.toLowerCase(),
      name: name.givenName,
      surname: name.familyName,
      picture,
    };

    done(null, user);
  }
}
