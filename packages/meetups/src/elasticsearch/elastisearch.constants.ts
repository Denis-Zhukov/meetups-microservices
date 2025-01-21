export const INDEX = 'meetups';

export const elasticSearchConfig = {
  index: INDEX,
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
};
