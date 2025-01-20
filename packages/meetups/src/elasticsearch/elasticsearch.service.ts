import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { Meetup } from '@prisma/client';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly client: Client;

  constructor(cfgService: ConfigService<EnvConfig>) {
    this.client = new Client({ node: cfgService.getOrThrow('ELASTIC_HOST') });
  }

  async onModuleInit() {
    const indexExists = await this.client.indices.exists({ index: 'meetups' });

    if (indexExists.body) return;

    await this.client.indices.create({
      index: 'meetups',
      body: {
        settings: {
          analysis: {
            analyzer: {
              morphology_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'hunspell_ru'],
              },
            },
            filter: {
              hunspell_ru: {
                type: 'hunspell',
                locale: 'ru_RU',
                dictionary: 'ru_RU',
                dedup: true,
              },
            },
          },
        },
        mappings: {
          dynamic_templates: [
            {
              strings: {
                match_mapping_type: 'string',
                mapping: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                    morphology: {
                      type: 'text',
                      analyzer: 'morphology_analyzer',
                    },
                  },
                },
              },
            },
          ],
        },
      },
    });
  }

  async indexMeetup(meetup: Meetup) {
    await this.client.index({
      index: 'meetups',
      id: meetup.id,
      body: meetup,
    });
  }

  async searchMeetups(query: string) {
    const response = await this.client.search({
      index: 'meetups',
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
