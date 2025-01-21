import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { Meetup } from '@prisma/client';
import {
  elasticSearchConfig,
  INDEX,
} from '@/elasticsearch/elastisearch.constants';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly client: Client;

  constructor(cfgService: ConfigService<EnvConfig>) {
    this.client = new Client({ node: cfgService.getOrThrow('ELASTIC_HOST') });
  }

  async onModuleInit() {
    const indexExists = await this.client.indices.exists({ index: INDEX });

    if (indexExists.body) return;

    await this.client.indices.create(elasticSearchConfig);
  }

  async indexMeetup(meetup: Meetup) {
    await this.client.index({
      index: INDEX,
      id: meetup.id,
      body: meetup,
    });
  }

  async searchMeetups(query: string) {
    const response = await this.client.search({
      index: INDEX,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'description', 'tags'],
          },
        },
      },
    });

    return response.body.hits.hits.map((hit) => {
      return { ...hit._source, _score: hit._score };
    });
  }
}
