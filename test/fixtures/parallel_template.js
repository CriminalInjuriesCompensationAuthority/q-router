'use strict';

module.exports = {
    type: 'apply-for-compensation',
    version: '12.2.0',
    sections: {
        'p-applicant-confirmation-method': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                propertyNames: {
                    enum: [
                        'q-applicant-confirmation-method',
                        'q-applicant-enter-your-email-address',
                        'q-applicant-enter-your-telephone-number'
                    ]
                },
                properties: {
                    'q-applicant-confirmation-method': {
                        title: "How should we tell you we've got the application?",
                        type: 'string',
                        oneOf: [
                            {
                                title: 'Email',
                                const: 'email'
                            },
                            {
                                title: 'Text message',
                                const: 'text'
                            },
                            {
                                title: "I don't have an email address or UK mobile phone number",
                                description:
                                    'We will not be able to send you a text or an email confirmation. You will only get an on-screen confirmation with a reference number at the end of this application form. You’ll need to make a note of this reference number in case you need to contact us about your application.',
                                const: 'none'
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Confirmation method'
                            }
                        }
                    },
                    'q-applicant-enter-your-email-address': {
                        type: 'string',
                        title: 'Email address',
                        maxLength: 50,
                        format: 'email',
                        errorMessage: {
                            maxLength: 'Email address must be 50 characters or less',
                            format:
                                'Enter an email address in the correct format, like name@example.com'
                        },
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            }
                        }
                    },
                    'q-applicant-enter-your-telephone-number': {
                        type: 'string',
                        title: 'UK mobile phone number',
                        maxLength: 20,
                        format: 'mobile-uk',
                        errorMessage: {
                            format:
                                'Enter a UK mobile phone number, like 07700 900 982 or +44 7700 900 982',
                            maxLength: 'Telephone number must be 20 characters or less'
                        },
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            }
                        }
                    }
                },
                required: ['q-applicant-confirmation-method'],
                allOf: [
                    {
                        $ref:
                            '#/definitions/if-email-then-q-applicant-enter-your-email-address-is-required'
                    },
                    {
                        $ref:
                            '#/definitions/if-text-then-q-applicant-enter-your-telephone-number-is-required'
                    },
                    {
                        $ref: '#/definitions/if-none-then-phone-and-email-explicitly-not-required'
                    }
                ],
                definitions: {
                    'if-email-then-q-applicant-enter-your-email-address-is-required': {
                        if: {
                            properties: {
                                'q-applicant-confirmation-method': {
                                    const: 'email'
                                }
                            },
                            required: ['q-applicant-confirmation-method']
                        },
                        then: {
                            required: ['q-applicant-enter-your-email-address'],
                            propertyNames: {
                                enum: [
                                    'q-applicant-confirmation-method',
                                    'q-applicant-enter-your-email-address'
                                ]
                            },
                            errorMessage: {
                                required: {
                                    'q-applicant-enter-your-email-address': 'Enter an email address'
                                }
                            }
                        }
                    },
                    'if-text-then-q-applicant-enter-your-telephone-number-is-required': {
                        if: {
                            properties: {
                                'q-applicant-confirmation-method': {
                                    const: 'text'
                                }
                            },
                            required: ['q-applicant-confirmation-method']
                        },
                        then: {
                            required: ['q-applicant-enter-your-telephone-number'],
                            propertyNames: {
                                enum: [
                                    'q-applicant-confirmation-method',
                                    'q-applicant-enter-your-telephone-number'
                                ]
                            },
                            errorMessage: {
                                required: {
                                    'q-applicant-enter-your-telephone-number':
                                        'Enter a UK mobile phone number'
                                }
                            }
                        }
                    },
                    'if-none-then-phone-and-email-explicitly-not-required': {
                        if: {
                            properties: {
                                'q-applicant-confirmation-method': {
                                    const: 'none'
                                }
                            },
                            required: ['q-applicant-confirmation-method']
                        },
                        then: {
                            additionalProperties: false,
                            properties: {
                                'q-applicant-confirmation-method': {
                                    const: 'none'
                                }
                            },
                            required: ['q-applicant-confirmation-method']
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-confirmation-method':
                            'Select how you want to get your confirmation message'
                    }
                },
                examples: [
                    {
                        'q-applicant-confirmation-method': 'none'
                    },
                    {
                        'q-applicant-confirmation-method': 'email',
                        'q-applicant-enter-your-email-address': 'foo@bar.com'
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-telephone-number': '07701 234567'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-confirmation-method': 'none',
                        'q-applicant-enter-your-email-address': 'foo@bar.com'
                    },
                    {
                        'q-applicant-confirmation-method': 'none',
                        'q-applicant-enter-your-telephone-number': '07701 234567'
                    },
                    {
                        'q-applicant-confirmation-method': 'email'
                    },
                    {
                        'q-applicant-confirmation-method': 'text'
                    },
                    {
                        'q-applicant-confirmation-method': 'email',
                        'q-applicant-enter-your-telephone-number': '07701 234567'
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-email-address': 'foo@bar.com'
                    },
                    {
                        'q-applicant-confirmation-method': 'email',
                        'q-applicant-enter-your-email-address': 'not an email address'
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-telephone-number': 'not a UK mobile phone number'
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-telephone-number': '0141 420 5000'
                    },
                    {
                        'q-applicant-confirmation-method': 10
                    },
                    {
                        'q-applicant-confirmation-method': false
                    },
                    {
                        'q-applicant-confirmation-method': true,
                        'q-applicant-enter-your-email-address': true
                    },
                    {
                        'q-applicant-confirmation-method': 'none',
                        'q-applicant-enter-your-email-address': ['something']
                    },
                    {
                        'q-applicant-confirmation-method': 'none',
                        'q-applicant-enter-your-email-address': 123
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-email-address': true
                    },
                    {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-telephone-number': 123
                    },
                    {
                        'q-applicant-confirmation-method': 'email',
                        'q-applicant-enter-your-telephone-number': false
                    }
                ]
            }
        },
        'p-applicant-are-you-18-or-over': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-are-you-18-or-over'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-are-you-18-or-over',
                        resources: {
                            'q-applicant-are-you-18-or-over': {
                                title: {
                                    myself: 'Are you 18 or over?',
                                    proxy: 'Are they 18 or over?'
                                },
                                error: {
                                    myself: 'Select yes if you are 18 or over',
                                    proxy: 'Select yes if they are 18 or over'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            myself: 'Are you 18 or over?',
                                            proxy: 'Are they 18 or over?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-are-you-18-or-over'],
                additionalProperties: false,
                properties: {
                    'q-applicant-are-you-18-or-over': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'q-applicant-are-you-18-or-over.title.myself',
                            ['|role.all', 'proxy'],
                            'q-applicant-are-you-18-or-over.title.proxy'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-are-you-18-or-over.meta.summary.title.myself',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-are-you-18-or-over.meta.summary.title.proxy'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-are-you-18-or-over': [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'q-applicant-are-you-18-or-over.error.myself',
                            ['|role.all', 'proxy'],
                            'q-applicant-are-you-18-or-over.error.proxy'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-are-you-18-or-over': true
                    },
                    {
                        'q-applicant-are-you-18-or-over': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-are-you-18-or-over': 'foo'
                    }
                ]
            }
        },
        'p-applicant-who-are-you-applying-for': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-who-are-you-applying-for'],
                additionalProperties: false,
                properties: {
                    'q-applicant-who-are-you-applying-for': {
                        title: 'Who are you applying for?',
                        type: 'string',
                        oneOf: [
                            {
                                title: 'Myself',
                                description: 'I am the person claiming compensation.',
                                const: 'myself'
                            },
                            {
                                title: 'Someone else',
                                description:
                                    'I am a representative filling out the form for someone else.',
                                const: 'someone-else'
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            integration: {
                                hideOnSummary: true
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-who-are-you-applying-for': 'Select who you are applying for'
                    }
                },
                examples: [
                    {
                        'q-applicant-who-are-you-applying-for': 'myself'
                    },
                    {
                        'q-applicant-who-are-you-applying-for': 'someone-else'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-who-are-you-applying-for': 12345
                    }
                ]
            }
        },
        'p--was-the-crime-reported-to-police': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q--was-the-crime-reported-to-police'],
                additionalProperties: false,
                properties: {
                    'q--was-the-crime-reported-to-police': {
                        title: 'Was the crime reported to the police?',
                        type: 'boolean',
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            }
                        }
                    },
                    'dont-know-if-crime-reported': {
                        description:
                            '{% from "components/details/macro.njk" import govukDetails %}{% set templateHtml %}{% include \'contact.njk\' %}{% endset %}{{ govukDetails({summaryText: "I do not know if the crime was reported to the police",html: \'<p class="govuk-body">If you do not know if the crime was reported to the police, call 101 to speak to your local police station. They can help you with this.</p>\'})}}'
                    }
                },
                errorMessage: {
                    required: {
                        'q--was-the-crime-reported-to-police':
                            'Select yes if the crime was reported to the police'
                    }
                },
                examples: [
                    {
                        'q--was-the-crime-reported-to-police': true
                    },
                    {
                        'q--was-the-crime-reported-to-police': false
                    }
                ],
                invalidExamples: [
                    {
                        'q--was-the-crime-reported-to-police': 'foo'
                    }
                ]
            }
        },
        'p-applicant-enter-your-name': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-enter-your-name'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-enter-your-name',
                        resources: {
                            title: {
                                myself: 'Enter your name',
                                proxy: {
                                    nonDeceased: "Enter the victim's name",
                                    deceased: "Enter the claimant's name"
                                }
                            },
                            'q-applicant-title': {
                                error: {
                                    myself: 'Enter your title',
                                    nonDeceased: "Enter the victim's title",
                                    deceased: 'Enter the claimant’s title'
                                }
                            },
                            'q-applicant-first-name': {
                                error: {
                                    myself: 'Enter your first name',
                                    nonDeceased: "Enter the victim's first name",
                                    deceased: 'Enter the claimant’s first name'
                                }
                            },
                            'q-applicant-last-name': {
                                error: {
                                    myself: 'Enter your last name',
                                    nonDeceased: "Enter the victim's first name",
                                    deceased: "Enter the claimant's last name"
                                }
                            },
                            meta: {
                                summary: {
                                    title: {
                                        myself: 'Your name',
                                        nonDeceased: "The victim's name",
                                        deceased: "The claimant's name"
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                allOf: [
                    {
                        title: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'title.myself',
                            ['|role.all', 'proxy', 'nonDeceased'],
                            'title.proxy.nonDeceased',
                            ['|role.all', 'proxy', 'deceased'],
                            'title.proxy.deceased'
                        ],
                        meta: {
                            compositeId: 'applicant-name',
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'meta.summary.title.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'meta.summary.title.nonDeceased',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'meta.summary.title.deceased'
                                ]
                            }
                        },
                        required: [
                            'q-applicant-title',
                            'q-applicant-first-name',
                            'q-applicant-last-name'
                        ],
                        propertyNames: {
                            enum: [
                                'q-applicant-title',
                                'q-applicant-first-name',
                                'q-applicant-last-name'
                            ]
                        },
                        allOf: [
                            {
                                properties: {
                                    'q-applicant-title': {
                                        title: 'Title',
                                        type: 'string',
                                        maxLength: 6,
                                        errorMessage: {
                                            maxLength: 'Title must be 6 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-first-name': {
                                        title: 'First name',
                                        type: 'string',
                                        maxLength: 70,
                                        errorMessage: {
                                            maxLength: 'First name must be 70 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-last-name': {
                                        title: 'Last name',
                                        type: 'string',
                                        maxLength: 70,
                                        errorMessage: {
                                            maxLength: 'Last name must be 70 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            }
                        ],
                        errorMessage: {
                            required: {
                                'q-applicant-title': [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-title.error.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'q-applicant-title.error.nonDeceased',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'q-applicant-title.error.deceased'
                                ],
                                'q-applicant-first-name': [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-first-name.error.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'q-applicant-first-name.error.nonDeceased',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'q-applicant-first-name.error.deceased'
                                ],
                                'q-applicant-last-name': [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-last-name.error.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'q-applicant-last-name.error.nonDeceased',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'q-applicant-last-name.error.deceased'
                                ]
                            }
                        }
                    }
                ],
                examples: [
                    {
                        'q-applicant-title': 'Mr',
                        'q-applicant-first-name': 'Foo',
                        'q-applicant-last-name': 'Bar'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-title': 12345,
                        'q-applicant-first-name': 'Foo',
                        'q-applicant-last-name': 'Bar'
                    },
                    {
                        'q-applicant-title': 'Mr',
                        'q-applicant-first-name': 12345,
                        'q-applicant-last-name': 'Bar'
                    },
                    {
                        'q-applicant-title': 'Mr',
                        'q-applicant-first-name': 'Foo',
                        'q-applicant-last-name': 12345
                    }
                ]
            }
        },
        'p-applicant-have-you-been-known-by-any-other-names': {
            l10n: {
                vars: {
                    lng: 'en',
                    context: {
                        $data:
                            '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                    },
                    ns: 'p-applicant-have-you-been-known-by-any-other-names'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-have-you-been-known-by-any-other-names',
                        resources: {
                            'q-applicant-have-you-been-known-by-any-other-names': {
                                title: 'Have you ever been known by any other names?',
                                'title_someone-else':
                                    'Have they ever been known by any other names?',
                                error: {
                                    required:
                                        'Select yes if you have ever been known by any other names',
                                    'required_someone-else':
                                        'Select yes if they have ever been known by any other names'
                                },
                                description: {
                                    applicant:
                                        'We need to know any other names you have used, for example, your maiden name.',
                                    proxy:
                                        'We need to know any other names they have used, for example, their maiden name.'
                                }
                            },
                            'q-applicant-what-other-names-have-you-used': {
                                title: 'What other names have you been known by?',
                                'title_someone-else': 'What other names have they been known by?',
                                error: {
                                    required: "Enter the other names you've been known by",
                                    maxLength:
                                        "Other names you've been known by must be 50 characters or less",
                                    'required_someone-else':
                                        "Enter the other names they've been known by",
                                    'maxLength_someone-else':
                                        "Other names they've been known by must be 50 characters or less"
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                propertyNames: {
                    enum: [
                        'q-applicant-have-you-been-known-by-any-other-names',
                        'q-applicant-what-other-names-have-you-used'
                    ]
                },
                required: ['q-applicant-have-you-been-known-by-any-other-names'],
                additionalProperties: false,
                properties: {
                    'q-applicant-have-you-been-known-by-any-other-names': {
                        type: 'boolean',
                        title:
                            'l10nt:q-applicant-have-you-been-known-by-any-other-names.title{?lng,context,ns}',
                        description: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'q-applicant-have-you-been-known-by-any-other-names.description.applicant',
                            ['|role.all', 'proxy'],
                            'q-applicant-have-you-been-known-by-any-other-names.description.proxy'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title:
                                    'l10nt:q-applicant-have-you-been-known-by-any-other-names.title{?lng,context,ns}'
                            }
                        }
                    },
                    'q-applicant-what-other-names-have-you-used': {
                        type: 'string',
                        title:
                            'l10nt:q-applicant-what-other-names-have-you-used.title{?lng,context,ns}',
                        maxLength: 50,
                        errorMessage: {
                            maxLength:
                                'l10nt:q-applicant-what-other-names-have-you-used.error.maxLength{?lng,context,ns}'
                        },
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            }
                        }
                    }
                },
                allOf: [
                    {
                        $ref: '#/definitions/if-yes-then-q-what-other-names-is-required'
                    }
                ],
                definitions: {
                    'if-yes-then-q-what-other-names-is-required': {
                        if: {
                            properties: {
                                'q-applicant-have-you-been-known-by-any-other-names': {
                                    const: true
                                }
                            },
                            required: ['q-applicant-have-you-been-known-by-any-other-names']
                        },
                        then: {
                            required: ['q-applicant-what-other-names-have-you-used'],
                            propertyNames: {
                                enum: [
                                    'q-applicant-have-you-been-known-by-any-other-names',
                                    'q-applicant-what-other-names-have-you-used'
                                ]
                            },
                            errorMessage: {
                                required: {
                                    'q-applicant-what-other-names-have-you-used':
                                        'l10nt:q-applicant-what-other-names-have-you-used.error.required{?lng,context,ns}'
                                }
                            }
                        },
                        else: {
                            required: ['q-applicant-have-you-been-known-by-any-other-names']
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-have-you-been-known-by-any-other-names':
                            'l10nt:q-applicant-have-you-been-known-by-any-other-names.error.required{?lng,context,ns}'
                    }
                },
                examples: [
                    {
                        'q-applicant-have-you-been-known-by-any-other-names': true,
                        'q-applicant-what-other-names-have-you-used': 'Mr Biz Baz'
                    },
                    {
                        'q-applicant-have-you-been-known-by-any-other-names': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-have-you-been-known-by-any-other-names': 'foo'
                    },
                    {
                        'q-applicant-what-other-names-have-you-used': 'Mr Biz Baz'
                    },
                    {
                        'q-applicant-have-you-been-known-by-any-other-names': true,
                        'q-applicant-what-other-names-have-you-used': null
                    }
                ],
                options: {
                    transformOrder: [
                        'q-applicant-what-other-names-have-you-used',
                        'q-applicant-have-you-been-known-by-any-other-names'
                    ],
                    outputOrder: ['q-applicant-have-you-been-known-by-any-other-names'],
                    properties: {
                        'q-applicant-have-you-been-known-by-any-other-names': {
                            options: {
                                macroOptions: {
                                    classes: 'govuk-radios'
                                },
                                conditionalComponentMap: [
                                    {
                                        itemValue: true,
                                        componentIds: ['q-applicant-what-other-names-have-you-used']
                                    }
                                ]
                            }
                        },
                        'q-applicant-what-other-names-have-you-used': {
                            options: {
                                macroOptions: {
                                    classes: 'govuk-input--width-20'
                                }
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-enter-your-date-of-birth': {
            l10n: {
                vars: {
                    lng: 'en',
                    context: {
                        $data:
                            '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                    },
                    ns: 'p-applicant-enter-your-date-of-birth'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-enter-your-date-of-birth',
                        resources: {
                            'q-applicant-enter-your-date-of-birth': {
                                title: 'Enter your date of birth',
                                'title_someone-else': 'Enter their date of birth',
                                error: {
                                    required:
                                        'Enter your date of birth and include a day, month and year',
                                    format:
                                        'Enter your date of birth and include a day, month and year',
                                    'required_someone-else':
                                        'Enter their date of birth and include a day, month and year',
                                    'format_someone-else':
                                        'Enter their date of birth and include a day, month and year'
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-enter-your-date-of-birth'],
                additionalProperties: false,
                properties: {
                    'q-applicant-enter-your-date-of-birth': {
                        title: 'l10nt:q-applicant-enter-your-date-of-birth.title{?lng,context,ns}',
                        meta: {
                            keywords: {
                                format: {
                                    precision: 'YYYY-MM-DD'
                                }
                            },
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Date of birth'
                            }
                        },
                        type: 'string',
                        format: 'date-time',
                        description: 'For example, 31 12 1989.',
                        errorMessage: {
                            format:
                                'l10nt:q-applicant-enter-your-date-of-birth.error.format{?lng,context,ns}'
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-enter-your-date-of-birth':
                            'l10nt:q-applicant-enter-your-date-of-birth.error.required{?lng,context,ns}'
                    }
                },
                examples: [
                    {
                        'q-applicant-enter-your-date-of-birth': '1970-01-01T00:00:00.000Z'
                    },
                    {
                        'q-applicant-enter-your-date-of-birth': '2019-01-01T00:00:00.000Z'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-enter-your-date-of-birth': 12345
                    },
                    {
                        'q-applicant-enter-your-date-of-birth': 'not a date'
                    }
                ]
            }
        },
        'p-applicant-enter-your-email-address': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'q-applicant-enter-your-email-address': {
                        type: 'string',
                        title: 'Enter your email address (optional)',
                        description:
                            'We may use this to contact you if we need to clarify something in your application.',
                        maxLength: 50,
                        format: 'email',
                        errorMessage: {
                            maxLength: 'Email address must be 50 characters or less',
                            format: 'Enter your email address, for example john.smith@email.com'
                        },
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Email address'
                            }
                        }
                    }
                },
                examples: [
                    {
                        'q-applicant-enter-your-email-address': 'foo@hhjhjk34h5jkh24kj5h2k45.com'
                    },
                    {}
                ],
                invalidExamples: [
                    {
                        'q-applicant-enter-your-email-address': 12345
                    }
                ]
            }
        },
        'p-applicant-enter-your-address': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-enter-your-address'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-enter-your-address',
                        resources: {
                            title: {
                                myself: 'Enter your address',
                                proxy: 'Enter their address'
                            },
                            'q-applicant-town-or-city': {
                                error: {
                                    myself: 'Enter the town or city where you live',
                                    proxy: 'Enter the town or city where they live'
                                }
                            },
                            meta: {
                                summary: {
                                    title: {
                                        myself: 'Your address',
                                        proxy: {
                                            nonDeceased: "The victim's address",
                                            deceased: "The claimant's address"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                allOf: [
                    {
                        title: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'title.myself',
                            ['|role.all', 'proxy'],
                            'title.proxy'
                        ],
                        meta: {
                            compositeId: 'applicant-address',
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'meta.summary.title.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'meta.summary.title.proxy.nonDeceased',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'meta.summary.title.proxy.deceased'
                                ]
                            }
                        },
                        required: [
                            'q-applicant-building-and-street',
                            'q-applicant-town-or-city',
                            'q-applicant-postcode'
                        ],
                        propertyNames: {
                            enum: [
                                'q-applicant-building-and-street',
                                'q-applicant-building-and-street-2',
                                'q-applicant-building-and-street-3',
                                'q-applicant-town-or-city',
                                'q-applicant-postcode'
                            ]
                        },
                        allOf: [
                            {
                                properties: {
                                    'q-applicant-building-and-street': {
                                        type: 'string',
                                        title: 'Address line 1',
                                        maxLength: 32,
                                        errorMessage: {
                                            maxLength:
                                                'First line of address must be 32 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-building-and-street-2': {
                                        type: 'string',
                                        title: 'Address line 2 (optional)',
                                        maxLength: 32,
                                        errorMessage: {
                                            maxLength:
                                                'Second line of address must be 32 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-building-and-street-3': {
                                        type: 'string',
                                        title: 'Address line 3 (optional)',
                                        maxLength: 32,
                                        errorMessage: {
                                            maxLength:
                                                'Third line of address must be 32 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-town-or-city': {
                                        type: 'string',
                                        title: 'Town or city',
                                        maxLength: 32,
                                        errorMessage: {
                                            maxLength: 'Town or city must be 32 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                properties: {
                                    'q-applicant-postcode': {
                                        type: 'string',
                                        title: 'Postcode',
                                        description:
                                            'This could be a UK postcode or an international postal or zip code.',
                                        maxLength: 10,
                                        errorMessage: {
                                            maxLength: 'Postcode must be 10 characters or less'
                                        },
                                        meta: {
                                            classifications: {
                                                theme: 'applicant-details'
                                            }
                                        }
                                    }
                                }
                            }
                        ],
                        errorMessage: {
                            required: {
                                'q-applicant-building-and-street':
                                    'Enter the first line of the address',
                                'q-applicant-town-or-city': [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-town-or-city.error.myself',
                                    ['|role.all', 'proxy', 'nonDeceased'],
                                    'q-applicant-town-or-city.error.proxy',
                                    ['|role.all', 'proxy', 'deceased'],
                                    'q-applicant-town-or-city.error.proxy'
                                ],
                                'q-applicant-postcode':
                                    'Enter a UK postcode, international postal code or zip code'
                            }
                        }
                    }
                ],
                examples: [
                    {
                        'q-applicant-building-and-street': '1 Foo Lane',
                        'q-applicant-building-and-street-2': 'Flat 2/3',
                        'q-applicant-building-and-street-3': 'FooLocality',
                        'q-applicant-town-or-city': 'FooCity',
                        'q-applicant-postcode': 'G1 1XX'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-building-and-street': 12345,
                        'q-applicant-building-and-street-2': 'Flat 2/3',
                        'q-applicant-building-and-street-3': 'FooLocality',
                        'q-applicant-town-or-city': 'FooCity',
                        'q-applicant-postcode': 'G1 1XX'
                    },
                    {
                        'q-applicant-building-and-street': '1 Foo Lane',
                        'q-applicant-building-and-street-2': 12345,
                        'q-applicant-building-and-street-3': 'FooLocality',
                        'q-applicant-town-or-city': 'FooCity',
                        'q-applicant-postcode': 'G1 1XX'
                    },
                    {
                        'q-applicant-building-and-street': '1 Foo Lane',
                        'q-applicant-building-and-street-2': 'Flat 2/3',
                        'q-applicant-building-and-street-3': 12345,
                        'q-applicant-town-or-city': 'FooCity',
                        'q-applicant-postcode': 'G1 1XX'
                    },
                    {
                        'q-applicant-building-and-street': '1 Foo Lane',
                        'q-applicant-building-and-street-2': 'Flat 2/3',
                        'q-applicant-building-and-street-3': 'FooLocality',
                        'q-applicant-town-or-city': 12345,
                        'q-applicant-postcode': 'G1 1XX'
                    },
                    {
                        'q-applicant-building-and-street': '1 Foo Lane',
                        'q-applicant-building-and-street-2': 'Flat 2/3',
                        'q-applicant-building-and-street-3': 'FooLocality',
                        'q-applicant-town-or-city': 'FooCity',
                        'q-applicant-postcode': 12345
                    }
                ]
            }
        },
        'p-applicant-enter-your-telephone-number': {
            l10n: {
                vars: {
                    lng: 'en',
                    context: {
                        $data:
                            '/answers/p-applicant-who-are-you-applying-for/q-applicant-who-are-you-applying-for'
                    },
                    ns: 'p-applicant-enter-your-telephone-number'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-enter-your-telephone-number',
                        resources: {
                            'q-applicant-enter-your-telephone-number': {
                                title: 'Enter your telephone number (optional)',
                                'title_someone-else': 'Enter their telephone number (optional)',
                                description:
                                    'We may use this to contact you if we need to clarify something in your application.',
                                'description_someone-else':
                                    'We may use this to contact them if we cannot contact you for any reason.'
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'q-applicant-enter-your-telephone-number': {
                        type: 'string',
                        title:
                            'l10nt:q-applicant-enter-your-telephone-number.title{?lng,context,ns}',
                        description:
                            'l10nt:q-applicant-enter-your-telephone-number.description{?lng,context,ns}',
                        maxLength: 20,
                        pattern: '^[\\+\\d][\\d \\(\\)\\+\\-\\#]{7,19}$',
                        errorMessage: {
                            maxLength: 'Telephone number must be 20 characters or less',
                            pattern:
                                'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
                        },
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Telephone number'
                            }
                        }
                    }
                },
                examples: [
                    {
                        'q-applicant-enter-your-telephone-number': '01632 960 001'
                    },
                    {}
                ],
                invalidExamples: [
                    {
                        'q-applicant-enter-your-telephone-number': 12345
                    }
                ]
            }
        },
        'p--context-applicant-details': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p--context-applicant-details'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p--context-applicant-details',
                        resources: {
                            'context-applicant-details': {
                                title: {
                                    myself: 'Your details',
                                    proxy: {
                                        nonDeceased: 'Victim details',
                                        deceased: 'Claimant details'
                                    }
                                },
                                description: {
                                    myself:
                                        '<p class="govuk-body">We’re going to ask for some details about you.</p><p class="govuk-body">We’ll use these to:</p><ul class="govuk-list govuk-list--bullet"><li>contact you</li><li>get a report about the crime from the police</li></ul>',
                                    proxy: {
                                        nonDeceased:
                                            '<p class="govuk-body">We’re going to ask for some details about the victim.</p><p class="govuk-body">We’ll use these to get a report about the crime from the police.</p>',
                                        deceased:
                                            '<p class="govuk-body">We’re going to ask for some details about the claimant.</p><p class="govuk-body">We’ll use these to get a report about the crime from the police.</p>'
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'context-applicant-details': {
                        title: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'context-applicant-details.title.myself',
                            ['|role.all', 'proxy', 'nonDeceased'],
                            'context-applicant-details.title.proxy.nonDeceased',
                            ['|role.all', 'proxy', 'deceased'],
                            'context-applicant-details.title.proxy.deceased'
                        ],
                        description: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'context-applicant-details.description.myself',
                            ['|role.all', 'proxy', 'nonDeceased'],
                            'context-applicant-details.description.proxy.nonDeceased',
                            ['|role.all', 'proxy', 'deceased'],
                            'context-applicant-details.description.proxy.deceased'
                        ]
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-fatal-claim': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-fatal-claim'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-fatal-claim',
                        resources: {
                            'q-applicant-fatal-claim': {
                                title: {
                                    myself:
                                        'I am applying because I was the victim of a violent crime',
                                    proxy:
                                        'I am applying on behalf of someone who was the victim of a violent crime'
                                },
                                description: {
                                    myself:
                                        'If you are paying for the funeral of the person who died, you may be able to get help with the cost. If you are their relative, you may also be eligible for bereavement payments.',
                                    proxy:
                                        "If the person you're applying on behalf of is paying for the funeral of the person who died, they may be able to get help with the cost. If they are their relative, they may also be eligible for bereavement payments."
                                },
                                details: {
                                    myself:
                                        '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "Both of these options apply to me",html: "<p class=\'govuk-body\'>If both of the options above apply you\'ll need to make 2 separate applications.</p>"})}}',
                                    proxy:
                                        '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "Both of these options apply",html: "<p class=\'govuk-body\'>If both of the options above apply you\'ll need to make 2 separate applications.</p>"})}}'
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-fatal-claim'],
                additionalProperties: false,
                properties: {
                    'q-applicant-fatal-claim': {
                        type: 'boolean',
                        title: "Select the reason you're applying",
                        oneOf: [
                            {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-fatal-claim.title.myself',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-fatal-claim.title.proxy'
                                ],
                                description:
                                    'This could include a physical injury, disabling mental injury or abuse over a period of time. The disabling mental injury could be due to witnessing a loved one being injured in a violent crime.',
                                const: false
                            },
                            {
                                title: 'I am applying because someone died due to a violent crime',
                                description: [
                                    '|l10nt',
                                    ['|role.all', 'myself'],
                                    'q-applicant-fatal-claim.description.myself',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-fatal-claim.description.proxy'
                                ],
                                const: true
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            summary: {
                                title: 'Select why you are applying'
                            },
                            integration: {
                                hideOnSummary: true
                            }
                        }
                    },
                    'applicant-fatal-claim-info': {
                        description: [
                            '|l10nt',
                            ['|role.all', 'myself'],
                            'q-applicant-fatal-claim.details.myself',
                            ['|role.all', 'proxy'],
                            'q-applicant-fatal-claim.details.proxy'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-fatal-claim': "Select the reason you're applying"
                    }
                },
                examples: [
                    {
                        'q-applicant-fatal-claim': true
                    },
                    {
                        'q-applicant-fatal-claim': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-fatal-claim': 'foo'
                    }
                ]
            }
        },
        'p--context-residency-and-nationality': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p--context-residency-and-nationality'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p--context-residency-and-nationality',
                        resources: {
                            'residency-context': {
                                title: {
                                    applicant: 'About your residency and nationality',
                                    proxy: {
                                        nonDeceased: 'About the victim’s residency and nationality',
                                        deceased: 'About the claimant’s residency and nationality'
                                    }
                                },
                                description: {
                                    applicant:
                                        '<p class="govuk-body">We\'re going to ask you some questions about your residency and nationality when the crime happened. This is so we can work out if you\'re eligible to get compensation from us for this crime.</p><p class="govuk-body"><a class="govuk-link" href="https://www.gov.uk/guidance/criminal-injuries-compensation-residency-and-nationality" target="_blank">Find out how the Criminal Injuries Compensation Scheme\'s residency and nationality requirements work (opens in new tab)</a>.</p>',
                                    proxy: {
                                        nonDeceased:
                                            '<p class="govuk-body">We\'re going to ask you some questions about the victim\'s residency and nationality when the crime happened. This is so we can work out if they\'re eligible to get compensation from us for this crime.</p><p class="govuk-body"><a class="govuk-link" href="https://www.gov.uk/guidance/criminal-injuries-compensation-residency-and-nationality" target="_blank">Find out how the Criminal Injuries Compensation Scheme\'s residency and nationality requirements work (opens in new tab)</a>.</p>',
                                        deceased:
                                            '<p class="govuk-body">We\'re going to ask you some questions about the claimant\'s residency and nationality when the crime happened. This is so we can work out if they\'re eligible to get compensation from us for this crime.</p><p class="govuk-body"><a class="govuk-link" href="https://www.gov.uk/guidance/criminal-injuries-compensation-residency-and-nationality" target="_blank">Find out how the Criminal Injuries Compensation Scheme\'s residency and nationality requirements work (opens in new tab)</a>.</p>'
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'residency-context': {
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy', 'nonDeceased'],
                            'residency-context.title.proxy.nonDeceased',
                            ['|role.all', 'proxy', 'deceased'],
                            'residency-context.title.proxy.deceased',
                            ['|role.all'],
                            'residency-context.title.applicant'
                        ],
                        description: [
                            '|l10nt',
                            ['|role.all', 'proxy', 'nonDeceased'],
                            'residency-context.description.proxy.nonDeceased',
                            ['|role.all', 'proxy', 'deceased'],
                            'residency-context.description.proxy.deceased',
                            ['|role.all'],
                            'residency-context.description.applicant'
                        ]
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-armed-forces-relative': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-armed-forces-relative'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-armed-forces-relative',
                        resources: {
                            'q-applicant-armed-forces-relative': {
                                title: {
                                    applicant:
                                        'Were you a close relative of a member of the British Armed Forces living together when the crime happened?',
                                    proxy:
                                        'Were they a close relative of a member of the British Armed Forces living together when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "Help with who qualifies as a close relative of a member of the British Armed Forces",html: "<p class=\'govuk-body\'>A person is a close relative of a member of the British Armed Forces if they are living together as part of the same household and is either:</p>\n <ul class=\'govuk-list govuk-list--bullet\'>\n <li>their spouse or civil partner</li>\n <li>their partner (other than a spouse or civil partner) for a continuous period of at least two years immediately before the date of the crime</li>\n <li>a child aged under 18 of that member of the British Armed Forces or of their spouse, civil partner or partner</li>\n <li>a child of that member of the British Armed Forces who is financially or physically dependent on that person as a result of a physical or mental disability</li></ul>"})}}'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a close relative of a member of the British Armed Forces living together when the crime happened',
                                    proxy:
                                        'Select yes if they were a close relative of a member of the British Armed Forces living together when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a close relative of a member of the British Armed Forces living together when the crime happened?',
                                            proxy:
                                                'Were they a close relative of a member of the British Armed Forces living together when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-armed-forces-relative'],
                additionalProperties: false,
                properties: {
                    'q-applicant-armed-forces-relative': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-armed-forces-relative.title.proxy',
                            ['|role.all'],
                            'q-applicant-armed-forces-relative.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-armed-forces-relative.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-armed-forces-relative.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'armed-forces-relative-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-armed-forces-relative.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-armed-forces-relative': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-armed-forces-relative.error.proxy',
                            ['|role.all'],
                            'q-applicant-armed-forces-relative.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-armed-forces-relative': true
                    },
                    {
                        'q-applicant-armed-forces-relative': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-armed-forces-relative': 'foo'
                    }
                ]
            }
        },
        'p-applicant-armed-forces': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-armed-forces'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-armed-forces',
                        resources: {
                            'q-applicant-armed-forces': {
                                title: {
                                    applicant:
                                        'Were you a member of the British Armed Forces when the crime happened?',
                                    proxy:
                                        'Were they a member of the British Armed Forces when the crime happened?'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a member of the British Armed Forces when the crime happened',
                                    proxy:
                                        'Select yes if they were a member of the British Armed Forces when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a member of the British Armed Forces when the crime happened?',
                                            proxy:
                                                'Were they a member of the British Armed Forces when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-armed-forces'],
                additionalProperties: false,
                properties: {
                    'q-applicant-armed-forces': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-armed-forces.title.proxy',
                            ['|role.all'],
                            'q-applicant-armed-forces.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-armed-forces.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-armed-forces.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-armed-forces': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-armed-forces.error.proxy',
                            ['|role.all'],
                            'q-applicant-armed-forces.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-armed-forces': true
                    },
                    {
                        'q-applicant-armed-forces': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-armed-forces': 'foo'
                    }
                ]
            }
        },
        'p-applicant-applied-for-asylum': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-applied-for-asylum'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-applied-for-asylum',
                        resources: {
                            'q-applicant-applied-for-asylum': {
                                title: {
                                    applicant: 'Have you applied for asylum in the UK?',
                                    proxy: 'Have they applied for asylum in the UK?'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you have applied for asylum in the UK',
                                    proxy: 'Select yes if they have applied for asylum in the UK'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant: 'Have you applied for asylum in the UK?',
                                            proxy: 'Have they applied for asylum in the UK?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-applied-for-asylum'],
                additionalProperties: false,
                properties: {
                    'q-applicant-applied-for-asylum': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-applied-for-asylum.title.proxy',
                            ['|role.all'],
                            'q-applicant-applied-for-asylum.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-applied-for-asylum.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-applied-for-asylum.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-applied-for-asylum': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-applied-for-asylum.error.proxy',
                            ['|role.all'],
                            'q-applicant-applied-for-asylum.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-applied-for-asylum': true
                    },
                    {
                        'q-applicant-applied-for-asylum': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-applied-for-asylum': 'foo'
                    }
                ]
            }
        },
        'p-applicant-british-citizen-relative': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-british-citizen-relative'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-british-citizen-relative',
                        resources: {
                            'q-applicant-british-citizen-relative': {
                                title: {
                                    applicant:
                                        'Were you a close relative of a British citizen when the crime happened?',
                                    proxy:
                                        'Were they a close relative of a British citizen when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "Help with who qualifies as a close relative of a British citizen",html: "<p class=\'govuk-body\'>A person is a close relative of a British citizen if they are living together as part of the same household and is either:</p><ul class=\'govuk-list govuk-list--bullet\'><li>their spouse or civil partner\n </li><li>their partner (other than a spouse or civil partner) for a continuous period of at least two years immediately before the date of the crime\n </li><li>a child aged under 18 of that citizen or of their spouse, civil partner or partner</li><li>a child of that citizen who is financially or physically dependent on that person as a result of a physical or mental disability</li></ul>"})}}'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a close relative of a British citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were a close relative of a British citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a close relative of a British citizen when the crime happened?',
                                            proxy:
                                                'Were they a close relative of a British citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-british-citizen-relative'],
                additionalProperties: false,
                properties: {
                    'q-applicant-british-citizen-relative': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-british-citizen-relative.title.proxy',
                            ['|role.all'],
                            'q-applicant-british-citizen-relative.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-british-citizen-relative.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-british-citizen-relative.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'british-close-relative-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-british-citizen-relative.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-british-citizen-relative': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-british-citizen-relative.error.proxy',
                            ['|role.all'],
                            'q-applicant-british-citizen-relative.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-british-citizen-relative': true
                    },
                    {
                        'q-applicant-british-citizen-relative': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-british-citizen-relative': 'foo'
                    }
                ]
            }
        },
        'p-applicant-british-citizen': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-british-citizen'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-british-citizen',
                        resources: {
                            'q-applicant-british-citizen': {
                                title: {
                                    applicant:
                                        'Were you a British citizen when the crime happened?',
                                    proxy: 'Were they a British citizen when the crime happened?'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a British citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were a British citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a British citizen when the crime happened?',
                                            proxy:
                                                'Were they a British citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-british-citizen'],
                additionalProperties: false,
                properties: {
                    'q-applicant-british-citizen': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-british-citizen.title.proxy',
                            ['|role.all'],
                            'q-applicant-british-citizen.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-british-citizen.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-british-citizen.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-british-citizen': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-british-citizen.error.proxy',
                            ['|role.all'],
                            'q-applicant-british-citizen.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-british-citizen': true
                    },
                    {
                        'q-applicant-british-citizen': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-british-citizen': 'foo'
                    }
                ]
            }
        },
        'p-applicant-eea-citizen-relative': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-eea-citizen-relative'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-eea-citizen-relative',
                        resources: {
                            'q-applicant-eea-citizen-relative': {
                                title: {
                                    applicant:
                                        'Were you in the UK legally because you were the family member of an EEA citizen when the crime happened?',
                                    proxy:
                                        'Were they in the UK legally because they were the family member of an EEA citizen when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '<p class="govuk-body">Check the <a class="govuk-link" href="https://www.gov.uk/eu-eea" target="_blank">countries in the EEA (opens in new tab)</a>.</p>'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were in the UK legally because you were the family member of an EEA citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were in the UK legally because they were the family member of an EEA citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you in the UK legally because you were the family member of an EEA citizen when the crime happened?',
                                            proxy:
                                                'Were they in the UK legally because they were the family member of an EEA citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-eea-citizen-relative'],
                additionalProperties: false,
                properties: {
                    'q-applicant-eea-citizen-relative': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eea-citizen-relative.title.proxy',
                            ['|role.all'],
                            'q-applicant-eea-citizen-relative.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-eea-citizen-relative.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-eea-citizen-relative.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'eea-citizen-relative-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-eea-citizen-relative.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-eea-citizen-relative': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eea-citizen-relative.error.proxy',
                            ['|role.all'],
                            'q-applicant-eea-citizen-relative.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-eea-citizen-relative': true
                    },
                    {
                        'q-applicant-eea-citizen-relative': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-eea-citizen-relative': 'foo'
                    }
                ]
            }
        },
        'p-applicant-eea-citizen': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-eea-citizen'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-eea-citizen',
                        resources: {
                            'q-applicant-eea-citizen': {
                                title: {
                                    applicant:
                                        'Were you a European Economic Area (EEA) citizen when the crime happened?',
                                    proxy:
                                        'Were they a European Economic Area (EEA) citizen when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '<p class="govuk-body">Check the <a class="govuk-link" href="https://www.gov.uk/eu-eea" target="_blank">countries in the EEA (opens in new tab)</a>.</p>'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a European Economic Area (EEA) citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were a European Economic Area (EEA) citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a European Economic Area (EEA) citizen when the crime happened?',
                                            proxy:
                                                'Were they a European Economic Area (EEA) citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-eea-citizen'],
                additionalProperties: false,
                properties: {
                    'q-applicant-eea-citizen': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eea-citizen.title.proxy',
                            ['|role.all'],
                            'q-applicant-eea-citizen.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-eea-citizen.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-eea-citizen.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'eea-citizen-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-eea-citizen.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-eea-citizen': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eea-citizen.error.proxy',
                            ['|role.all'],
                            'q-applicant-eea-citizen.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-eea-citizen': true
                    },
                    {
                        'q-applicant-eea-citizen': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-eea-citizen': 'foo'
                    }
                ]
            }
        },
        'p-applicant-eu-citizen-relative': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-eu-citizen-relative'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-eu-citizen-relative',
                        resources: {
                            'q-applicant-eu-citizen-relative': {
                                title: {
                                    applicant:
                                        'Were you in the UK legally because you were the family member of an EU citizen when the crime happened?',
                                    proxy:
                                        'Were they in the UK legally because they were the family member of an EU citizen when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '<p class="govuk-body">Check the <a class="govuk-link" href="https://www.gov.uk/eu-eea" target="_blank">countries in the EU (opens in new tab)</a>.</p>'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were in the UK legally because you were the family member of an EU citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were in the UK legally because they were the family member of an EU citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you in the UK legally because you were the family member of an EU citizen when the crime happened?',
                                            proxy:
                                                'Were they in the UK legally because they were the family member of an EU citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-eu-citizen-relative'],
                additionalProperties: false,
                properties: {
                    'q-applicant-eu-citizen-relative': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eu-citizen-relative.title.proxy',
                            ['|role.all'],
                            'q-applicant-eu-citizen-relative.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-eu-citizen-relative.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-eu-citizen-relative.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'eu-citizen-relative-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-eu-citizen-relative.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-eu-citizen-relative': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eu-citizen-relative.error.proxy',
                            ['|role.all'],
                            'q-applicant-eu-citizen-relative.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-eu-citizen-relative': true
                    },
                    {
                        'q-applicant-eu-citizen-relative': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-eu-citizen-relative': 'foo'
                    }
                ]
            }
        },
        'p-applicant-eu-citizen': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-eu-citizen'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-eu-citizen',
                        resources: {
                            'q-applicant-eu-citizen': {
                                title: {
                                    applicant: 'Were you an EU citizen when the crime happened?',
                                    proxy: 'Were they an EU citizen when the crime happened?'
                                },
                                details: {
                                    applicant:
                                        '<p class="govuk-body">Check the <a class="govuk-link" href="https://www.gov.uk/eu-eea" target="_blank">countries in the EU (opens in new tab)</a>.</p>'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were an EU citizen when the crime happened',
                                    proxy:
                                        'Select yes if they were an EU citizen when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you an EU citizen when the crime happened?',
                                            proxy:
                                                'Were they an EU citizen when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-eu-citizen'],
                additionalProperties: false,
                properties: {
                    'q-applicant-eu-citizen': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eu-citizen.title.proxy',
                            ['|role.all'],
                            'q-applicant-eu-citizen.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-eu-citizen.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-eu-citizen.meta.summary.title.applicant'
                                ]
                            }
                        }
                    },
                    'eu-citizen-info': {
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'q-applicant-eu-citizen.details.applicant'
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-eu-citizen': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-eu-citizen.error.proxy',
                            ['|role.all'],
                            'q-applicant-eu-citizen.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-eu-citizen': true
                    },
                    {
                        'q-applicant-eu-citizen': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-eu-citizen': 'foo'
                    }
                ]
            }
        },
        'p-applicant-ordinarily-resident': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-ordinarily-resident'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-ordinarily-resident',
                        resources: {
                            'q-applicant-ordinarily-resident': {
                                title: {
                                    applicant:
                                        'Were you ordinarily resident in the UK when the crime happened?',
                                    proxy:
                                        'Were they ordinarily resident in the UK when the crime happened?'
                                },
                                description: {
                                    applicant:
                                        'This means that you were living in the UK legally as part of your normal life. For example, you were working, studying or caring for someone in the UK.',
                                    proxy:
                                        'This means that they were living in the UK legally as part of their normal life. For example, they were working, studying or caring for someone in the UK.'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were ordinarily resident in the UK when the crime happened',
                                    proxy:
                                        'Select yes if they were ordinarily resident in the UK when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you ordinarily resident in the UK when the crime happened?',
                                            proxy:
                                                'Were they ordinarily resident in the UK when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-ordinarily-resident'],
                additionalProperties: false,
                properties: {
                    'q-applicant-ordinarily-resident': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-ordinarily-resident.title.proxy',
                            ['|role.all'],
                            'q-applicant-ordinarily-resident.title.applicant'
                        ],
                        description: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-ordinarily-resident.description.proxy',
                            ['|role.all'],
                            'q-applicant-ordinarily-resident.description.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-ordinarily-resident.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-ordinarily-resident.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-ordinarily-resident': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-ordinarily-resident.error.proxy',
                            ['|role.all'],
                            'q-applicant-ordinarily-resident.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-ordinarily-resident': true
                    },
                    {
                        'q-applicant-ordinarily-resident': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-ordinarily-resident': 'foo'
                    }
                ]
            }
        },
        'p-applicant-other-citizen': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-other-citizen'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-other-citizen',
                        resources: {
                            'other-citizen-info': {
                                title:
                                    'European Convention on the Compensation of Victims of Violent Crimes',
                                description: {
                                    applicant:
                                        '\n <p class="govuk-body">Victims of violent crime in the UK who were citizens of a country that had signed and ratified this convention when the crime happened, can apply for compensation.</p>\n <p class="govuk-body">Check the <a class="govuk-link" href="https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=116" target="_blank">countries that are party to this convention on the Council of Europe website (opens in new tab)</a>.</p>\n '
                                }
                            },
                            'q-applicant-other-citizen': {
                                title: {
                                    applicant:
                                        'Were you a citizen of a country that was party to the European convention when the crime happened?',
                                    proxy:
                                        'Were they a citizen of a country that was party to the European convention when the crime happened?'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you were a citizen of a country that was party to this convention when the crime happened',
                                    proxy:
                                        'Select yes if they were a citizen of a country that was party to this convention when the crime happened'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Were you a citizen of a country that was party to the European convention when the crime happened?',
                                            proxy:
                                                'Were they a citizen of a country that was party to the European convention when the crime happened?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-other-citizen'],
                additionalProperties: false,
                properties: {
                    'other-citizen-info': {
                        title: ['|l10nt', ['|role.all'], 'other-citizen-info.title'],
                        description: [
                            '|l10nt',
                            ['|role.all'],
                            'other-citizen-info.description.applicant'
                        ]
                    },
                    'q-applicant-other-citizen': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-other-citizen.title.proxy',
                            ['|role.all'],
                            'q-applicant-other-citizen.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-other-citizen.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-other-citizen.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-other-citizen': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-other-citizen.error.proxy',
                            ['|role.all'],
                            'q-applicant-other-citizen.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-other-citizen': true
                    },
                    {
                        'q-applicant-other-citizen': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-other-citizen': 'foo'
                    }
                ]
            }
        },
        'p-applicant-victim-human-trafficking': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p-applicant-victim-human-trafficking'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p-applicant-victim-human-trafficking',
                        resources: {
                            'q-applicant-victim-human-trafficking': {
                                title: {
                                    applicant:
                                        'Have you been referred as a potential victim of human trafficking in the UK?',
                                    proxy:
                                        'Have they been referred as a potential victim of human trafficking in the UK?'
                                },
                                error: {
                                    applicant:
                                        'Select yes if you have been referred as a potential victim of human trafficking in the UK',
                                    proxy:
                                        'Select yes if they have been referred as a potential victim of human trafficking in the UK'
                                },
                                meta: {
                                    summary: {
                                        title: {
                                            applicant:
                                                'Have you been referred as a potential victim of human trafficking in the UK?',
                                            proxy:
                                                'Have they been referred as a potential victim of human trafficking in the UK?'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-victim-human-trafficking'],
                additionalProperties: false,
                properties: {
                    'q-applicant-victim-human-trafficking': {
                        type: 'boolean',
                        title: [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-victim-human-trafficking.title.proxy',
                            ['|role.all'],
                            'q-applicant-victim-human-trafficking.title.applicant'
                        ],
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'residency-and-nationality'
                            },
                            summary: {
                                title: [
                                    '|l10nt',
                                    ['|role.all', 'proxy'],
                                    'q-applicant-victim-human-trafficking.meta.summary.title.proxy',
                                    ['|role.all'],
                                    'q-applicant-victim-human-trafficking.meta.summary.title.applicant'
                                ]
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-victim-human-trafficking': [
                            '|l10nt',
                            ['|role.all', 'proxy'],
                            'q-applicant-victim-human-trafficking.error.proxy',
                            ['|role.all'],
                            'q-applicant-victim-human-trafficking.error.applicant'
                        ]
                    }
                },
                examples: [
                    {
                        'q-applicant-victim-human-trafficking': true
                    },
                    {
                        'q-applicant-victim-human-trafficking': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-victim-human-trafficking': 'foo'
                    }
                ]
            }
        },
        'p-applicant-under-18': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-under-18'],
                additionalProperties: false,
                properties: {
                    'applicant-under-18-info': {
                        title: "You've told us you're under 18",
                        description:
                            '<p class="govuk-body">We need an adult to apply for compensation for you if you\'re under 18. Usually this is a parent, guardian or someone with a care order to look after you.</p>'
                    },
                    'q-applicant-under-18': {
                        title: 'Do you have someone aged 18 or over who can apply for you?',
                        type: 'boolean',
                        oneOf: [
                            {
                                title: 'I do not have someone who can apply for me',
                                const: true
                            },
                            {
                                title: 'I will get someone to apply for me',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            summary: "You've told us you're under 18"
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-under-18': 'Select one option'
                    }
                },
                examples: [
                    {
                        'q-applicant-under-18': false
                    },
                    {
                        'q-applicant-under-18': true
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-under-18': 12345
                    }
                ]
            }
        },
        'p--transition-someone-18-or-over-to-apply': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    transition: {
                        title:
                            "You've told us you want to get someone aged 18 or over to apply for you",
                        description:
                            '<p class="govuk-body">They\'ll have to <a class="govuk-link" href="/apply/start-or-resume">start a new application</a>.</p>'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-what-do-you-want-to-do': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-what-do-you-want-to-do'],
                additionalProperties: false,
                properties: {
                    'q-applicant-what-do-you-want-to-do': {
                        type: 'string',
                        title: 'What do you want to do?',
                        description:
                            'You will not be able to apply online yourself because of your age.',
                        oneOf: [
                            {
                                title: "Close this application and apply when you're 18",
                                const: 'close'
                            },
                            {
                                title:
                                    "Ask us to call you and we'll discuss if we can help you make your application over the phone",
                                const: 'call-back'
                            },
                            {
                                title:
                                    'Call us to discuss if we can help you make your application over the phone',
                                const: 'call-us'
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            summary: 'What do you want to do?'
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-what-do-you-want-to-do': 'Select one option'
                    }
                },
                examples: [
                    {
                        'q-applicant-what-do-you-want-to-do': 'close'
                    },
                    {
                        'q-applicant-what-do-you-want-to-do': 'call-back'
                    },
                    {
                        'q-applicant-what-do-you-want-to-do': 'call-us'
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-what-do-you-want-to-do': 'foo'
                    }
                ]
            }
        },
        'p--transition-apply-when-18': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    transition: {
                        title: "You've told us you want to wait and apply when you're 18",
                        description:
                            '<p class="govuk-body">You can <a class="govuk-link" href="https://www.gov.uk/claim-compensation-criminal-injury/eligibility">find out how long after your 18th birthday you\'ll have to apply</a>.</p>'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p--transition-request-a-call-back': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    transition: {
                        title: 'Continue to our call back request form',
                        description:
                            '<p class="govuk-body">You\'ll be taken to another website to request a call back.</p>{{ govukButton({text: "Continue",href: " https://request-a-call-back.form.service.justice.gov.uk/",isStartButton: true}) }}'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-declaration': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                title: 'Declaration',
                required: ['q-applicant-declaration'],
                propertyNames: {
                    enum: ['q-applicant-declaration']
                },
                allOf: [
                    {
                        properties: {
                            'applicant-declaration': {
                                description:
                                    '<div id="declaration"> <p class="govuk-body"> You have told us that you are ||/answers/p-applicant-enter-your-name/q-applicant-title|| ||/answers/p-applicant-enter-your-name/q-applicant-first-name|| ||/answers/p-applicant-enter-your-name/q-applicant-last-name|| and you are applying on behalf of yourself.</p> <p class="govuk-body">By submitting this application, you confirm that you understand the following:</p> <ul class="govuk-list govuk-list--bullet"> <li>the information given in this application for compensation is true</li> <li>Criminal Injuries Compensation Authority (CICA) may share and receive information with the following parties for the purposes of processing this application for compensation or verifying information provided:</li> <ul> <li>police, prosecutors and ACRO Criminal Records Office, including for the purposes of obtaining a report of the crime and a record of any criminal convictions you may have</li> <li>medical organisations, practitioners, and police medical staff to obtain medical evidence - including medical records and expert reports. CICA will let you know if this is required</li> <li>any other individuals or organisations where necessary to process this application</li> <li>any representative appointed to act for you in the course of this application</li> </ul> <li>CICA must be notified immediately of any change in circumstances relevant to this application, including any change of address and information about any other claim or proceedings which may give rise to a separate award or payment in respect of your injuries</li> </ul> <h2 class="govuk-heading-m">Providing wrong or misleading information</h2> <p class="govuk-body">If untrue or misleading information is deliberately provided, compensation may be refused and the person(s) responsible may be prosecuted.</p> <p class="govuk-body">Read our privacy notice to see <a href="https://www.gov.uk/guidance/cica-privacy-notice" class="govuk-link" target="_blank">how we use your data (opens in new tab)</a>. </p> <h2 class="govuk-heading-m">Information about appointing a legal or another representative</h2> <p class="govuk-body">It is not necessary to appoint a legal or other representative to act on a victim’s behalf. If a representative is appointed at any stage, please be aware that:</p> <ul class="govuk-list govuk-list--bullet"> <li>CICA cannot meet their costs </li> <li>we will only communicate directly with any appointed representative</li> </ul> <p class="govuk-body">If we make an award, we will pay it only to the victim or their legal representative. This is unless the application has been made on behalf of:</p> <ul class="govuk-list govuk-list--bullet"> <li>an adult who cannot manage their own financial affairs</li> <li>a child who is under 18 years of age</li> </ul> <p class="govuk-body"> It is our general policy to put an award for a child in an interest-earning deposit account until they reach the age of 18.</p> <p class="govuk-body"> If a monetary award is to be made and there is a dispute about outstanding legal fees, it is our policy to retain the disputed amount until the dispute has been resolved.</p> <p class="govuk-body"> If it is decided that a representative’s services are no longer required, CICA must be notified in writing as soon as possible.</p> </div>'
                            }
                        }
                    },
                    {
                        properties: {
                            'q-applicant-declaration': {
                                type: 'string',
                                title: 'I have read and understood the declaration',
                                const: 'i-agree'
                            }
                        }
                    }
                ],
                errorMessage: {
                    required: {
                        'q-applicant-declaration': 'Select that you have read and understood'
                    }
                },
                examples: [
                    {
                        'q-applicant-declaration': 'i-agree'
                    }
                ],
                invalidExamples: [
                    {},
                    {
                        foo: 'bar'
                    },
                    {
                        'q-applicant-declaration': true
                    },
                    {
                        'q-applicant-declaration': 'false'
                    },
                    {
                        'q-applicant-declaration': 123
                    },
                    {
                        'q-applicant-declaration': [123]
                    }
                ]
            }
        },
        'p--confirmation': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'p--confirmation'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'p--confirmation',
                        resources: {
                            confirmation: {
                                description: {
                                    noContactMethod:
                                        '{% set mobilePhoneNumber = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong><br />Make a note of your reference number. You\'ll need this if you contact us about this application. You will not get another confirmation of this reference number once you exit this screen</p>" %}\n {% else %}\n {% set html = "<p>We\'re experiencing a delay getting your reference number at the moment. Call us in 5 working days and we should be able to give you your reference number. </p><p>You should make a note of your reference number when you get it. You\'ll need this if you contact us about your application. You will not get another confirmation of this reference number unless you call us.</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about your injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>',
                                    adult: {
                                        nonDeceased:
                                            '{% set mobilePhoneNumber = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about your injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>',
                                        deceased:
                                            '{% set mobilePhoneNumber = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in your applicaton you should wait for us to contect you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>'
                                    },
                                    mainapplicant: {
                                        adult: {
                                            nonDeceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send certified documents to prove you have the legal authority to act on the victim’s behalf</h2>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document you’re named on</li>\n <li>court order showing you have legal authority to act on behalf of the victim</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor. <a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents (opens in new tab)</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email your documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim\'s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                            deceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send certified documents to prove you have the legal authority to act on the claimant’s behalf</h2>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document you’re named on</li>\n <li>court order showing you have legal authority to act on behalf of the claimant</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor. <a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents (opens in new tab)</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email these documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. </p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimant gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to this application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                        },
                                        child: {
                                            nonDeceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">Send proof you can apply on the victim’s behalf</h2>\n <p class="govuk-body">This proof can be one of the following documents:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>the victim’s full birth certificate</li>\n <li>adoption documents</li>\n <li>a parental responsibility agreement</li>\n <li>a court order</li>\n </ul>\n <p class="govuk-body">You should copy the document in one of these ways to send to us:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>take a photo</li>\n <li>scan a copy</li>\n <li>make a photocopy</li>\n </ul>\n <p class="govuk-body">You should email your documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim\'s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                            deceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||" %}\n {% set emailAddress = "||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">Send proof you can apply on the claimant’s behalf</h2>\n <p class="govuk-body">This proof can be one of the following documents:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>the claimant’s full birth certificate</li>\n <li>adoption documents</li>\n <li>a parental responsibility agreement</li>\n <li>a court order</li>\n </ul>\n <p class="govuk-body">You should copy the document in one of these ways to send to us:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>take a photo</li>\n <li>scan a copy</li>\n <li>make a photocopy</li>\n </ul>\n <p class="govuk-body">You should email these documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimant gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to this application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                        }
                                    },
                                    rep: {
                                        adult: {
                                            capable: {
                                                nonDeceased:
                                                    '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim’s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                                deceased:
                                                    '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimant gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to this application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                            },
                                            incapable: {
                                                nonDeceased:
                                                    '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send certified documents to prove the person with legal authority can act on the victim’s behalf</h2>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document they’re named on</li>\n <li>court order showing they have legal authority to act on behalf of the victim</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor. <a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents (opens in new tab)</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email your documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim\'s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                                deceased:
                                                    '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p><strong>The reference number for your funeral costs claim is:" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send certified documents to prove the person with legal authority can act on the claimant’s behalf</h2>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document they’re named on</li>\n <li>court order showing they have legal authority to act on behalf of the claimant</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor. <a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents (opens in new tab)</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email these documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimant gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to this application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                            }
                                        },
                                        child: {
                                            nonDeceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send proof of who has parental responsibility to apply on the victim’s behalf</h2>\n <p class="govuk-body">This proof can be one of the following documents:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>the victim’s full birth certificate</li>\n <li>adoption documents</li>\n <li>a parental responsibility agreement</li>\n <li>a court order</li>\n </ul>\n <p class="govuk-body">You should copy the document in one of these ways to send to us:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>take a photo</li>\n <li>scan a copy</li>\n <li>make a photocopy</li>\n </ul>\n <p class="govuk-body">You should email your documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim\'s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                            deceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p><strong>The reference number for your funeral costs claim is:" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p> number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n \n <h2 class="govuk-heading-m">Send proof of who has parental responsibility to apply on the claimant’s behalf</h2>\n <p class="govuk-body">This proof can be one of the following documents:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>the claimant’s full birth certificate</li>\n <li>adoption documents</li>\n <li>a parental responsibility agreement</li>\n <li>a court order</li>\n </ul>\n <p class="govuk-body">You should copy the document in one of these ways to send to us:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>take a photo</li>\n <li>scan a copy</li>\n <li>make a photocopy</li>\n </ul>\n <p class="govuk-body">You should email these documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimants gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to this application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                        },
                                        noauthority: {
                                            nonDeceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">Send certified documents to prove who has legal authority to act on the victim’s behalf</h2>\n <p class="govuk-body">We understand this might not be confirmed as yet. Unfortunately, we’re unable to progress the application any further until we have these details though. You can send this to us at a later date.</p>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document you’re named on</li>\n <li>court order showing you have legal authority to act on behalf of the victim</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email your documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for medical information if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer. We may have to wait until there’s enough information about the victim\'s injuries and recovery.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about your application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in your application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>you stop using or change representative</li>\n <li>you get compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about your application</a></p>\n <h2 class="govuk-heading-m">Contact us</h2>\n <p class="govuk-body">As we\'ve only received this application, we will now carry out necessary initial enquiries relating to this. Unless you\'ve anything new to add or update in the application, we kindly ask that you wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about your case and has no effect on your application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n ',
                                            deceased:
                                                '{% set mobilePhoneNumber = "||/answers/p-rep-confirmation-method/q-rep-telephone-number||" %}\n {% set emailAddress = "||/answers/p-rep-confirmation-method/q-rep-email-address||" %}\n {% set caseReferenceNumber = "||/answers/system/case-reference||" %}\n {% set secondaryReference = "||/answers/system/secondary-reference||" %}\n {% if mobilePhoneNumber %}\n {% set contactMethod = mobilePhoneNumber %}\n {% else %}\n {% set contactMethod = emailAddress %}\n {% endif %}\n {% if secondaryReference %}\n {% set html = "<p>The reference number for your bereavement claim is: <br /><strong>" + caseReferenceNumber + "</strong></p><p>The reference number for your funeral costs claim is: <br /><strong>" + secondaryReference + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% elif caseReferenceNumber %}\n {% set html = "<p>Your reference number is <br /><strong>" + caseReferenceNumber + "</strong></p><p>We have sent a confirmation to <strong>" + contactMethod + "</strong></p>" %}\n {% else %}\n {% set html = "<p>We\'ll send your confirmation to <strong>" + contactMethod + "</strong> soon</p>" %}\n {% endif %}\n {% set contact %}\n {% include \'contact.njk\' %}\n {% endset %}\n <p class="govuk-body">All links on this page open in a new tab.</p>\n {{ govukPanel({\n titleText: "Application submitted",\n html: html\n })}}\n <p class="govuk-body">Thank you for submitting this application.</p>\n <h2 class="govuk-heading-m">Send certified documents to prove who has legal authority to act on the claimant’s behalf</h2>\n <p class="govuk-body">We understand this might not be confirmed. Unfortunately, we’re unable to progress the application any further until we have these details. You can send this to us at a later date.</p>\n <p class="govuk-body">This proof should be a certified copy of a:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>power of attorney document you’re named on</li>\n <li>court order showing you have legal authority to act on behalf of the claimant</li>\n </ul>\n <p class="govuk-body">To certify a document as a true copy of the original document, you need to get it signed and dated by someone in a professional capacity – such as a solicitor.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.gov.uk/certifying-a-document">Discover more information about certifying documents</a> if you’re still unsure about sending these to us.</p>\n <p class="govuk-body">You should email these documents to us at <a href="mailto:centraladminaction@cica.gov.uk">centraladminaction@cica.gov.uk.</a></p>\n <p class="govuk-body">If you cannot send these documents by email, you can post them to us at:</p>\n <p class="govuk-body govuk-!-margin-bottom-1"><strong>Criminal Injuries Compensation Authority</strong></p>\n <p class="govuk-body govuk-!-margin-bottom-1">10 Clyde Place</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Buchanan Wharf</p>\n <p class="govuk-body govuk-!-margin-bottom-1">Glasgow</p>\n <p class="govuk-body govuk-!-margin-bottom-1">G5 8AQ</p>\n <p class="govuk-body">United Kingdom</p>\n <h2 class="govuk-heading-m">What happens next</h2>\n <p class="govuk-body">We will:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>ask the police for evidence</li>\n <li>ask for proof of funeral costs if required</li>\n <li>ask you for more information if we need it</li>\n <li>make a decision</li>\n <li>send our decision letter by post</li>\n </ul>\n <p class="govuk-body">We aim to make a decision within 12 months but it can take longer.</p>\n <p class="govuk-body">Read our <a class="govuk-link" target="_blank" href="https://www.gov.uk/government/organisations/criminal-injuries-compensation-authority/about-our-services">Customer Charter</a></p>\n {{ govukWarningText({\n text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n iconFallbackText: "Warning"\n }) }}\n <h2 class="govuk-heading-m">Sending updated information about this application</h2>\n <p class="govuk-body">You should send us any updates using our contact form.</p>\n <p class="govuk-body">If any information in this application changes, you need to <strong>contact us immediately</strong> to let us know. This may include:</p>\n <ul class="govuk-list govuk-list--bullet">\n <li>your contact or personal details change</li>\n <li>any change of representative</li>\n <li>the claimant gets compensation or money from any other sources after you apply in relation to the incident</li>\n <li>you have new information to add to your application</li>\n <li>information you provided previously has changed</li>\n </ul>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://contact-the-cica.form.service.justice.gov.uk/">Send an update about this application</a></p>\n <h2 class="govuk-heading-m">If you need to contact us</h2>\n <p class="govuk-body">Unless you\'ve anything to update in this application you should wait for us to contact you.</p>\n {{ govukDetails({\n summaryText: "View the different ways to contact CICA",\n html: contact\n })}}\n <h2 class="govuk-heading-m">Help us improve this service</h2>\n <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n <p class="govuk-body">It does not ask for any details about this case and has no effect on this application.</p>\n <p class="govuk-body"><a class="govuk-link" target="_blank" href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service (opens in new tab)</a> (takes 10 minutes)</p>\n '
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    confirmation: {
                        title: 'Confirmation',
                        description: [
                            '|l10nt',
                            ['|role.all', 'noContactMethod'],
                            'confirmation.description.noContactMethod',
                            ['|role.all', 'mainapplicant', 'adult', 'nonDeceased'],
                            'confirmation.description.mainapplicant.adult.nonDeceased',
                            ['|role.all', 'mainapplicant', 'adult', 'deceased'],
                            'confirmation.description.mainapplicant.adult.deceased',
                            ['|role.all', 'mainapplicant', 'child', 'nonDeceased'],
                            'confirmation.description.mainapplicant.child.nonDeceased',
                            [
                                'or',
                                ['|role.all', 'mainapplicant', 'child', 'deceased', 'childOver12'],
                                ['|role.all', 'mainapplicant', 'child', 'deceased', 'childUnder12']
                            ],
                            'confirmation.description.mainapplicant.child.deceased',
                            ['|role.all', 'rep', 'adult', 'capable', 'nonDeceased'],
                            'confirmation.description.rep.adult.capable.nonDeceased',
                            ['|role.all', 'rep', 'adult', 'capable', 'deceased'],
                            'confirmation.description.rep.adult.capable.deceased',
                            ['|role.all', 'rep', 'noauthority', 'nonDeceased'],
                            'confirmation.description.rep.noauthority.nonDeceased',
                            ['|role.all', 'rep', 'noauthority', 'deceased'],
                            'confirmation.description.rep.noauthority.deceased',
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'nonDeceased'],
                            'confirmation.description.rep.adult.incapable.nonDeceased',
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased'],
                            'confirmation.description.rep.adult.incapable.deceased',
                            ['|role.all', 'rep', 'child', 'nonDeceased'],
                            'confirmation.description.rep.child.nonDeceased',
                            ['|role.all', 'rep', 'child', 'deceased'],
                            'confirmation.description.rep.child.deceased',
                            ['|role.all', 'adult', 'nonDeceased'],
                            'confirmation.description.adult.nonDeceased',
                            ['|role.all', 'adult', 'deceased'],
                            'confirmation.description.adult.deceased'
                        ]
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-task-list': {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'task-list'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'task-list',
                        resources: {
                            's-about-application': {
                                title: {
                                    adult: {
                                        capable: 'Tell us about your application'
                                    },
                                    proxy: "Tell us about the victim's application",
                                    deceased: "Tell us about the claimant's application"
                                },
                                tasks: {
                                    't-about-application': {
                                        title: {
                                            adult: {
                                                capable: 'About your application'
                                            },
                                            proxy: "About the victim's application",
                                            deceased: "About the claimant's application"
                                        }
                                    }
                                }
                            },
                            s_applicant_details: {
                                title: {
                                    adult: {
                                        capable: 'Provide your details'
                                    },
                                    proxy: "Provide the victim's details",
                                    deceased: "Provide the claimant's details"
                                },
                                tasks: {
                                    't_applicant_personal-details': {
                                        title: {
                                            adult: {
                                                capable: 'Your details'
                                            },
                                            proxy: "Victim's details",
                                            deceased: "Claimant's details"
                                        }
                                    },
                                    't_applicant_residency-and-nationality': {
                                        title: {
                                            adult: {
                                                capable: 'Your residency and nationality'
                                            },
                                            proxy: "Victim's residency and nationality",
                                            deceased: "Claimant's residency and nationality"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['task-list'],
                properties: {
                    'task-list': {
                        type: 'object',
                        title: 'Claim criminal injuries compensation',
                        description:
                            'You can <a href="/account/sign-in" class="govuk-link">create a GOV.UK One Login</a> to save your application and return to it later.',
                        properties: {
                            taskListInfo: {
                                type: 'object',
                                labelCompleted: 'Completed',
                                labelIncomplete: 'Incomplete',
                                labelCannotStart: 'Cannot start yet',
                                sections: [
                                    {
                                        id: 's-about-application',
                                        title: [
                                            '|l10nt',
                                            ['|role.all', 'proxy', 'nonDeceased'],
                                            's-about-application.title.proxy',
                                            [
                                                'or',
                                                ['|role.all', 'myself', 'deceased'],
                                                ['|role.all', 'myself', 'nonDeceased']
                                            ],
                                            's-about-application.title.adult.capable',
                                            ['|role.all', 'proxy', 'deceased'],
                                            's-about-application.title.deceased'
                                        ],
                                        tasks: [
                                            {
                                                id: 't-about-application',
                                                title: [
                                                    '|l10nt',
                                                    ['|role.all', 'proxy', 'nonDeceased'],
                                                    's-about-application.tasks.t-about-application.title.proxy',
                                                    [
                                                        'or',
                                                        ['|role.all', 'myself', 'deceased'],
                                                        ['|role.all', 'myself', 'nonDeceased']
                                                    ],
                                                    's-about-application.tasks.t-about-application.title.adult.capable',
                                                    ['|role.all', 'proxy', 'deceased'],
                                                    's-about-application.tasks.t-about-application.title.deceased'
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        id: 's_applicant_details',
                                        title: [
                                            '|l10nt',
                                            ['|role.all', 'proxy', 'nonDeceased'],
                                            's_applicant_details.title.proxy',
                                            [
                                                'or',
                                                ['|role.all', 'myself', 'deceased'],
                                                ['|role.all', 'myself', 'nonDeceased']
                                            ],
                                            's_applicant_details.title.adult.capable',
                                            ['|role.all', 'proxy', 'deceased'],
                                            's_applicant_details.title.deceased'
                                        ],
                                        tasks: [
                                            {
                                                id: 't_applicant_personal-details',
                                                title: [
                                                    '|l10nt',
                                                    ['|role.all', 'proxy', 'nonDeceased'],
                                                    's_applicant_details.tasks.t_applicant_personal-details.title.proxy',
                                                    [
                                                        'or',
                                                        ['|role.all', 'myself', 'deceased'],
                                                        ['|role.all', 'myself', 'nonDeceased']
                                                    ],
                                                    's_applicant_details.tasks.t_applicant_personal-details.title.adult.capable',
                                                    ['|role.all', 'proxy', 'deceased'],
                                                    's_applicant_details.tasks.t_applicant_personal-details.title.deceased'
                                                ]
                                            },
                                            {
                                                id: 't_applicant_residency-and-nationality',
                                                title: [
                                                    '|l10nt',
                                                    ['|role.all', 'proxy', 'nonDeceased'],
                                                    's_applicant_details.tasks.t_applicant_residency-and-nationality.title.proxy',
                                                    [
                                                        'or',
                                                        ['|role.all', 'myself', 'deceased'],
                                                        ['|role.all', 'myself', 'nonDeceased']
                                                    ],
                                                    's_applicant_details.tasks.t_applicant_residency-and-nationality.title.adult.capable',
                                                    ['|role.all', 'proxy', 'deceased'],
                                                    's_applicant_details.tasks.t_applicant_residency-and-nationality.title.deceased'
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        meta: {
                            classifications: {
                                theme: 'task-list'
                            }
                        }
                    }
                },
                examples: [
                    {
                        'task-list': {
                            taskListInfo: {
                                type: 'object',
                                labelCompleted: 'Completed',
                                labelIncomplete: 'Incomplete',
                                labelCannotStart: 'Cannot start yet',
                                sections: {}
                            }
                        }
                    }
                ],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-claim-type': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-claim-type'],
                additionalProperties: false,
                properties: {
                    'q-applicant-claim-type': {
                        title: 'What do you want to claim?',
                        type: 'boolean',
                        oneOf: [
                            {
                                title: 'I want to claim funeral costs only',
                                description:
                                    'The person who paid for the funeral could be eligible for funeral costs.',
                                const: true
                            },
                            {
                                title: 'I want to make a full claim',
                                description:
                                    'In addition to funeral costs anyone who is a qualifying relative could be eligible for other payments including bereavement, dependency, and child’s payments.',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'about-application'
                            },
                            summary: {
                                title: 'What do you want to claim?'
                            }
                        }
                    },
                    'applicant-claim-type-info': {
                        description:
                            '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "Other payments that qualifying relatives could be eligible for", html: \'<p class="govuk-body"><p class="govuk-body"><b>Bereavement payment</b></p><p class="govuk-body">Relatives of the person who died who could be eligible for a bereavement payment include:</p></p><ul class="govuk-list govuk-list--bullet"><li>parents</li><li>children (this includes adult children and children born after the crime happened)</li><li>a spouse or civil partner who was living in the same household or living apart but financially dependent on the person who died</li><li>a partner who was living in the same household continuously for at least 2 years immediately before the person died</li><li>a partner, spouse or civil partner who did not live with the person who died because of ill health</li></ul><p class="govuk-body"><b>Dependency payment</b></p><p>Relatives who were financially or physically dependent on the person who died who could be eligible for a dependency payment include:</p></p><ul class="govuk-list govuk-list--bullet"><li>all those eligible for a bereavement payment</li><li>a former spouse or former civil partner</li></ul><p class="govuk-body"><b>Child’s payment</b></p><p>Children of the person who died could also be eligible for a child’s payment. They must have been under 18 at the time of the person’s death and reliant on them for parental support.</p>\'}) }}'
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-claim-type': 'Select what you want to claim'
                    }
                },
                examples: [
                    {
                        'q-applicant-claim-type': true
                    },
                    {
                        'q-applicant-claim-type': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-claim-type': 'foo'
                    }
                ]
            }
        },
        'p-applicant-you-cannot-get-compensation': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'you-cannot-get-compensation': {
                        title:
                            "You cannot get compensation as you've told us the crime has not been reported to the police",
                        description:
                            '<p class="govuk-body">You can only get compensation from us if the crime has been reported to the police. This must have been done as soon as reasonably possible.</p>'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p--context-crime-ref-no': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'p--context-crime-ref-no': {
                        title:
                            "You'll need to give us the crime reference number as part of this application",
                        description:
                            '<p class="govuk-body">The police give every crime a reference number when it\'s reported. This is called a crime reference number. You\'ll need to give us this crime reference number as part of this application so you should make sure you know it.</p><p class="govuk-body">If you do not know your crime reference number, call 101 to speak to your local police station. They\'ll be able to tell you the crime reference number. You\'ll need to give them some details about the crime to help them find the correct case.</p><p class="govuk-body">If you do not have the crime reference number to hand, you can continue with your application but you\'ll need to enter it later.</p>'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p--transition-contact-us': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    'you-need-to-contact-us': {
                        title: 'Contact us',
                        description:
                            '<p class="govuk-body">You contact us by:</p>{% include \'contact.njk\' %}'
                    }
                },
                examples: [{}],
                invalidExamples: [
                    {
                        foo: 'bar'
                    }
                ]
            }
        },
        'p-applicant-can-handle-affairs': {
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                required: ['q-applicant-capable'],
                additionalProperties: false,
                properties: {
                    'q-applicant-capable': {
                        type: 'boolean',
                        title: 'Are they able to handle their affairs?',
                        description:
                            'This means they have the legal capacity to make decisions for themselves when needed.',
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true
                            },
                            {
                                title: 'No',
                                const: false
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'applicant-details'
                            },
                            summary: {
                                title: 'Are they able to handle their affairs?'
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-capable': 'Select yes if they are able to handle their affairs'
                    }
                },
                examples: [
                    {
                        'q-applicant-capable': true
                    },
                    {
                        'q-applicant-capable': false
                    }
                ],
                invalidExamples: [
                    {
                        'q-applicant-capable': 'foo'
                    }
                ]
            }
        }
    },
    routes: {
        initial: 't-about-application',
        referrer: 'https://www.gov.uk/claim-compensation-criminal-injury/make-claim',
        summary: ['p-applicant-declaration'],
        confirmation: 'p--confirmation',
        states: [
            {
                id: 't-about-application',
                initial: 'p-applicant-who-are-you-applying-for',
                states: {
                    'p-applicant-who-are-you-applying-for': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-are-you-18-or-over'
                                }
                            ]
                        }
                    },
                    'p-applicant-are-you-18-or-over': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p--was-the-crime-reported-to-police',
                                    cond: [
                                        'or',
                                        ['|role.all', 'proxy'],
                                        ['|role.all', 'adult', 'capable']
                                    ]
                                },
                                {
                                    target: 'p-applicant-under-18'
                                }
                            ]
                        }
                    },
                    'p-applicant-under-18': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p--transition-someone-18-or-over-to-apply',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-under-18.q-applicant-under-18',
                                        false
                                    ]
                                },
                                {
                                    target: 'p-applicant-what-do-you-want-to-do'
                                }
                            ]
                        }
                    },
                    'p--transition-apply-when-18': {
                        type: 'final'
                    },
                    'p--transition-request-a-call-back': {
                        type: 'final'
                    },
                    'p--transition-contact-us': {
                        type: 'final'
                    },
                    'p--transition-someone-18-or-over-to-apply': {
                        type: 'final'
                    },
                    'p-applicant-what-do-you-want-to-do': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p--transition-apply-when-18',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                        'close'
                                    ]
                                },
                                {
                                    target: 'p--transition-request-a-call-back',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                        'call-back'
                                    ]
                                },
                                {
                                    target: 'p--transition-contact-us',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                        'call-us'
                                    ]
                                }
                            ]
                        }
                    },
                    'p--was-the-crime-reported-to-police': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-you-cannot-get-compensation',
                                    cond: [
                                        '==',
                                        '$.answers.p--was-the-crime-reported-to-police.q--was-the-crime-reported-to-police',
                                        false
                                    ]
                                },
                                {
                                    target: 'p--context-crime-ref-no',
                                    cond: [
                                        '==',
                                        '$.answers.p--was-the-crime-reported-to-police.q--was-the-crime-reported-to-police',
                                        true
                                    ]
                                }
                            ]
                        }
                    },
                    'p--context-crime-ref-no': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-fatal-claim'
                                }
                            ]
                        }
                    },
                    'p-applicant-you-cannot-get-compensation': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-fatal-claim'
                                }
                            ]
                        }
                    },
                    'p-applicant-fatal-claim': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-claim-type',
                                    cond: ['|role.all', 'deceased']
                                },
                                {
                                    target: 'p-task-list',
                                    cond: ['|role.all', 'nonDeceased']
                                }
                            ]
                        }
                    },
                    'p-applicant-claim-type': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list'
                                }
                            ]
                        }
                    }
                },
                status: 'incomplete',
                answers: {},
                events: []
            },
            {
                id: 't_applicant_personal-details',
                initial: 'p--context-applicant-details',
                states: {
                    'p--context-applicant-details': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-enter-your-name',
                                    cond: ['|role.all', 'proxy']
                                },
                                {
                                    target: 'p-applicant-confirmation-method'
                                }
                            ]
                        }
                    },
                    'p-applicant-confirmation-method': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-enter-your-name'
                                }
                            ]
                        }
                    },
                    'p-applicant-enter-your-name': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-have-you-been-known-by-any-other-names'
                                }
                            ]
                        }
                    },
                    'p-applicant-have-you-been-known-by-any-other-names': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-enter-your-date-of-birth'
                                }
                            ]
                        }
                    },
                    'p-applicant-enter-your-date-of-birth': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-can-handle-affairs',
                                    cond: [
                                        'and',
                                        [
                                            'dateCompare',
                                            '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                            '>=',
                                            '-18',
                                            'years'
                                        ],
                                        ['|role.all', 'proxy']
                                    ]
                                },
                                {
                                    target: 'p-applicant-enter-your-address'
                                }
                            ]
                        }
                    },
                    'p-applicant-enter-your-address': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-enter-your-telephone-number',
                                    cond: [
                                        'or',
                                        [
                                            '==',
                                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                            'email'
                                        ],
                                        [
                                            'and',
                                            [
                                                'dateCompare',
                                                '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                                '>=',
                                                '-18',
                                                'years'
                                            ],
                                            [
                                                '==',
                                                '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                true
                                            ]
                                        ]
                                    ]
                                },
                                {
                                    target: 'p-applicant-enter-your-email-address',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                        'text'
                                    ]
                                },
                                {
                                    target: 'p-task-list'
                                }
                            ]
                        }
                    },
                    'p-applicant-enter-your-email-address': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list'
                                }
                            ]
                        }
                    },
                    'p-applicant-enter-your-telephone-number': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list'
                                }
                            ]
                        }
                    },
                    'p-applicant-can-handle-affairs': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-enter-your-address'
                                }
                            ]
                        }
                    }
                },
                status: 'incomplete',
                answers: {},
                events: []
            },
            {
                id: 't_applicant_residency-and-nationality',
                initial: 'p--context-residency-and-nationality',
                states: {
                    'p--context-residency-and-nationality': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-british-citizen'
                                }
                            ]
                        }
                    },
                    'p-applicant-british-citizen': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-british-citizen.q-applicant-british-citizen',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-british-citizen-relative',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-british-citizen.q-applicant-british-citizen',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-british-citizen-relative': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-british-citizen-relative.q-applicant-british-citizen-relative',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-ordinarily-resident',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-british-citizen-relative.q-applicant-british-citizen-relative',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-ordinarily-resident': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-ordinarily-resident.q-applicant-ordinarily-resident',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-eu-citizen',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-ordinarily-resident.q-applicant-ordinarily-resident',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-eu-citizen': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eu-citizen.q-applicant-eu-citizen',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-eu-citizen-relative',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eu-citizen.q-applicant-eu-citizen',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-eu-citizen-relative': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eu-citizen-relative.q-applicant-eu-citizen-relative',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-eea-citizen',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eu-citizen-relative.q-applicant-eu-citizen-relative',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-eea-citizen': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eea-citizen.q-applicant-eea-citizen',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-eea-citizen-relative',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eea-citizen.q-applicant-eea-citizen',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-eea-citizen-relative': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eea-citizen-relative.q-applicant-eea-citizen-relative',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-other-citizen',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-eea-citizen-relative.q-applicant-eea-citizen-relative',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-other-citizen': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-other-citizen.q-applicant-other-citizen',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-armed-forces',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-other-citizen.q-applicant-other-citizen',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-armed-forces': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-armed-forces.q-applicant-armed-forces',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-armed-forces-relative',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-armed-forces.q-applicant-armed-forces',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-armed-forces-relative': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-armed-forces-relative.q-applicant-armed-forces-relative',
                                        true
                                    ]
                                },
                                {
                                    target: 'p-applicant-victim-human-trafficking',
                                    cond: [
                                        '==',
                                        '$.answers.p-applicant-armed-forces-relative.q-applicant-armed-forces-relative',
                                        false
                                    ]
                                }
                            ]
                        }
                    },
                    'p-applicant-victim-human-trafficking': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-applicant-applied-for-asylum'
                                }
                            ]
                        }
                    },
                    'p-applicant-applied-for-asylum': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p-task-list'
                                }
                            ]
                        }
                    }
                },
                status: 'incomplete',
                answers: {},
                events: []
            },
            {
                id: 't-check-your-answers',
                initial: 'p-applicant-declaration',
                states: {
                    'p-applicant-declaration': {
                        on: {
                            ANSWER: [
                                {
                                    target: 'p--confirmation'
                                }
                            ]
                        }
                    },
                    'p--confirmation': {
                        type: 'final'
                    }
                },
                status: 'incomplete',
                answers: {},
                events: []
            }
        ],
        guards: {}
    },
    taskStatuses: {},
    taxonomies: {
        theme: {
            l10n: {
                vars: {
                    lng: 'en',
                    ns: 'theme'
                },
                translations: [
                    {
                        language: 'en',
                        namespace: 'theme',
                        resources: {
                            'applicant-details': {
                                title: {
                                    adult: {
                                        capable: 'Your details'
                                    },
                                    proxy: 'Victim details',
                                    deceased: 'Claimant details'
                                }
                            },
                            injuries: {
                                title: {
                                    adult: {
                                        capable: 'Your injuries'
                                    },
                                    proxy: "The victim's injuries"
                                }
                            },
                            'mental-health': {
                                title: {
                                    adult: {
                                        capable: 'Your mental health'
                                    },
                                    proxy: "The victim's mental health"
                                }
                            },
                            treatment: {
                                title: {
                                    adult: {
                                        capable: 'Your treatment'
                                    },
                                    proxy: "The victim's treatment"
                                }
                            },
                            'main-applicant-details': {
                                title: {
                                    rep: {
                                        child: 'Person with authority to apply',
                                        adult: {
                                            incapable: 'Person with authority to apply'
                                        }
                                    },
                                    proxy: 'Your details'
                                }
                            },
                            'residency-and-nationality': {
                                title: {
                                    applicant: 'About your residency and nationality',
                                    proxy: "About the victim's residency and nationality",
                                    deceased: "About the claimant's residency and nationality"
                                }
                            }
                        }
                    }
                ]
            },
            taxa: {
                'about-application': {
                    title: 'About your application'
                },
                'applicant-details': {
                    title: [
                        '|l10nt',
                        ['|role.all', 'proxy', 'nonDeceased'],
                        'applicant-details.title.proxy',
                        [
                            'or',
                            ['|role.all', 'myself', 'deceased'],
                            ['|role.all', 'myself', 'nonDeceased']
                        ],
                        'applicant-details.title.adult.capable',
                        ['|role.all', 'proxy', 'deceased'],
                        'applicant-details.title.deceased'
                    ]
                },
                crime: {
                    title: 'About the crime'
                },
                offender: {
                    title: 'About the offender'
                },
                injuries: {
                    title: [
                        '|l10nt',
                        ['|role.all', 'proxy'],
                        'injuries.title.proxy',
                        ['|role.all', 'adult', 'capable'],
                        'injuries.title.adult.capable'
                    ]
                },
                pregnancy: {
                    title: 'Pregnancy'
                },
                'mental-health': {
                    title: [
                        '|l10nt',
                        ['|role.all', 'proxy'],
                        'mental-health.title.proxy',
                        ['|role.all', 'adult', 'capable'],
                        'mental-health.title.adult.capable'
                    ]
                },
                impact: {
                    title: 'The impact the injuries have had'
                },
                'special-expenses': {
                    title: 'Special expenses'
                },
                treatment: {
                    title: [
                        '|l10nt',
                        ['|role.all', 'proxy'],
                        'treatment.title.proxy',
                        ['|role.all', 'adult', 'capable'],
                        'treatment.title.adult.capable'
                    ]
                },
                'other-compensation': {
                    title: 'Other compensation'
                },
                'additional-info': {
                    title: 'Additional information'
                },
                'main-applicant-details': {
                    title: [
                        '|l10nt',
                        ['|role.all', 'rep', 'child'],
                        'main-applicant-details.title.rep.child',
                        ['|role.all', 'rep', 'adult', 'incapable'],
                        'main-applicant-details.title.rep.adult.incapable',
                        ['|role.all', 'proxy'],
                        'main-applicant-details.title.proxy'
                    ]
                },
                'rep-details': {
                    title: 'Your details'
                },
                'residency-and-nationality': {
                    title: [
                        '|l10nt',
                        ['|role.all', 'proxy', 'deceased'],
                        'residency-and-nationality.title.deceased',
                        ['|role.all', 'proxy', 'nonDeceased'],
                        'residency-and-nationality.title.proxy',
                        ['|role.all'],
                        'residency-and-nationality.title.applicant'
                    ]
                },
                deceased: {
                    title: 'About the deceased'
                },
                'funeral-costs': {
                    title: 'Funeral costs'
                },
                'relationship-to-deceased': {
                    title: 'Relationship to deceased'
                },
                default: {
                    title: 'Other Information'
                }
            }
        }
    },
    meta: {
        questionnaireDocumentVersion: '5.0.0',
        onComplete: {
            actions: [
                {
                    description: 'Confirmation email - applicant:adult',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'adult', 'nonDeceased']
                    ],
                    data: {
                        templateId: '5d207246-99d7-4bb9-83e1-75a7847bb8fd',
                        emailAddress:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - applicant:adult.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'adult', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'adult', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: 'aad20568-2726-4d9f-b60c-41257e419c88',
                        emailAddress:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - applicant:adult.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'adult', 'deceased']
                    ],
                    data: {
                        templateId: '27a03b8a-d236-4a0d-a1e4-c2713327da96',
                        emailAddress:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - mainapplicant.applicant:adult:incapable',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'mainapplicant', 'adult', 'incapable', 'nonDeceased']
                    ],
                    data: {
                        templateId: '80843f77-a68c-4d7a-b3c9-42fd0de271c2',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - mainapplicant.applicant:adult:incapable.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '21f4d5de-a219-47c8-aa3e-e5489b0fc3ed',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - mainapplicant.applicant:adult:incapable.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                    ],
                    data: {
                        templateId: 'b4f6f5ec-c268-4c58-95f8-d0606317b8a2',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - mainapplicant.applicant:child',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'mainapplicant', 'child', 'nonDeceased']
                    ],
                    data: {
                        templateId: '668fac4a-3e1c-40e7-b7ac-090a410fbb03',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - mainapplicant.applicant:child.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'mainapplicant', 'child', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'mainapplicant', 'child', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '58708020-d8a5-4d96-b56f-91f5c4c4c590',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - mainapplicant.applicant:child.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'mainapplicant', 'child', 'deceased']
                    ],
                    data: {
                        templateId: 'ec24f2a6-1062-486d-bd13-c6f8812e43c9',
                        emailAddress:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep.applicant:adult:capable',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'rep', 'adult', 'capable', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'b21f1aa7-cc16-41e7-8b8e-5c69e52f21f9',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep.applicant:adult:capable.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: 'ed98bf04-f338-47cf-b949-4367d8f8b707',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep.applicant:adult:capable.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                    ],
                    data: {
                        templateId: '12bc4419-5e84-4714-b1c8-0527290bb567',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - rep.mainapplicant.applicant:adult:incapable.nonDeceased',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'a6583a82-51ca-4f8e-b8b8-cbca763dc59a',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - rep.mainapplicant.applicant:adult:incapable.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: 'a70aaff8-8299-448b-ac22-6579c840c8e6',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - rep.mainapplicant.applicant:adult:incapable.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                    ],
                    data: {
                        templateId: '74c5f4d2-9c66-4800-8a15-313a64938a43',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep.mainapplicant.applicant:child',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'rep', 'child', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'a0c7b011-b0df-4645-8ce3-6bd8f7905dfc',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep.mainapplicant.applicant:child.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'child', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'child', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: 'c72a9445-7d08-4db7-b7b9-a8d1900818ed',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - rep.mainapplicant.applicant:child.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'child', 'deceased']
                    ],
                    data: {
                        templateId: '5d51b70e-0335-44f6-aa33-736997ba90d8',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep:no-legal-authority.applicant',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['|role.all', 'rep', 'noauthority', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'fb865d9c-37b1-4077-b519-aacfe42c9951',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation email - rep:no-legal-authority.applicant.deceased',
                    type: 'sendEmail',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'noauthority', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'email'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'noauthority', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '54392a68-d12c-4f0d-8388-e8439fdbfc2f',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation email - rep:no-legal-authority.applicant.deceased.split',
                    type: 'sendEmail',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'email'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'noauthority', 'deceased']
                    ],
                    data: {
                        templateId: '621093ee-b732-4bdf-9026-0f03977502b7',
                        emailAddress: '||/answers/p-rep-confirmation-method/q-rep-email-address||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - applicant:adult',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'adult', 'nonDeceased']
                    ],
                    data: {
                        templateId: '3f1a741b-20de-4b0d-b8e8-224098291beb',
                        phoneNumber:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - applicant:adult.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'adult', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'adult', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '46e66520-6e0a-412b-a509-18a09c8bfa35',
                        phoneNumber:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - applicant:adult.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'adult', 'deceased']
                    ],
                    data: {
                        templateId: 'b9d81762-9125-4a19-a016-f54fab3de0d3',
                        phoneNumber:
                            '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - mainapplicant.applicant:adult:incapable',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'mainapplicant', 'adult', 'incapable', 'nonDeceased']
                    ],
                    data: {
                        templateId: '3e625f9f-75c4-4903-818e-220829bfc2af',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - mainapplicant.applicant:adult:incapable.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: 'fe1997b8-ba0e-4c97-94f2-d4d350868596',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - mainapplicant.applicant:adult:incapable.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'mainapplicant', 'adult', 'incapable', 'deceased']
                    ],
                    data: {
                        templateId: '9c4097d0-c617-431b-88ff-4f9893bd203e',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - mainapplicant.applicant:child',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'mainapplicant', 'child', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'd2185426-2177-4049-a5b1-b9c6b12e1a79',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - mainapplicant.applicant:child.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'mainapplicant', 'child', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'mainapplicant', 'child', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '228454a8-c178-4f50-a7ca-5cb934dcb8b8',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - mainapplicant.applicant:child.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'mainapplicant', 'child', 'deceased']
                    ],
                    data: {
                        templateId: 'f9be1af0-7d13-4710-a008-fddec42a9c5c',
                        phoneNumber:
                            '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep.applicant:adult:capable',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'rep', 'adult', 'capable', 'nonDeceased']
                    ],
                    data: {
                        templateId: 'b51e5e19-f469-4f8a-a5a2-00499da6f027',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep.applicant:adult:capable.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '1e764481-69c1-4d5a-8a05-fbadc09aa47c',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep.applicant:adult:capable.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'adult', 'capable', 'deceased']
                    ],
                    data: {
                        templateId: '05709516-af2a-4897-905f-0c72fb012d60',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - rep.mainapplicant.applicant:adult:incapable.nonDeceased',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'nonDeceased']
                    ],
                    data: {
                        templateId: '94a82598-6f6b-4ad0-abc3-ad3a157eb4a3',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - rep.mainapplicant.applicant:adult:incapable.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '6151b209-33de-40ec-88b0-7f1a4580bf18',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - rep.mainapplicant.applicant:adult:incapable.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'adult', 'incapable', 'authority', 'deceased']
                    ],
                    data: {
                        templateId: 'ee1119cd-3ec1-481c-bd97-ce62a4757eeb',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep.mainapplicant.applicant:child',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'rep', 'child', 'nonDeceased']
                    ],
                    data: {
                        templateId: '38047478-4b70-4add-b06c-62c7d93e8a23',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep.mainapplicant.applicant:child.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'child', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'child', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '768165a8-b5cf-4ce5-acfa-a1bb533aca91',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - rep.mainapplicant.applicant:child.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'child', 'deceased']
                    ],
                    data: {
                        templateId: '3006bbb8-cd37-483e-8c37-e25519716d3e',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep:no-legal-authority.applicant',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['|role.all', 'rep', 'noauthority', 'nonDeceased']
                    ],
                    data: {
                        templateId: '29674076-46ba-4150-adf0-5215c8fe8aa9',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description: 'Confirmation sms - rep:no-legal-authority.applicant.deceased',
                    type: 'sendSms',
                    cond: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', true],
                            ['|role.all', 'rep', 'noauthority', 'deceased']
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                'text'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-claim-type.q-applicant-claim-type',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                                false
                            ],
                            ['|role.all', 'rep', 'noauthority', 'deceased']
                        ]
                    ],
                    data: {
                        templateId: '1ef1b7ae-293c-456d-93b4-8646791450f9',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            caseReference: '||/answers/system/case-reference||'
                        },
                        reference: null
                    }
                },
                {
                    description:
                        'Confirmation sms - rep:no-legal-authority.applicant.deceased.split',
                    type: 'sendSms',
                    cond: [
                        'and',
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'text'
                        ],
                        ['==', '$.answers.p-applicant-claim-type.q-applicant-claim-type', false],
                        [
                            '==',
                            '$.answers.p-applicant-funeral-costs-paid.q-applicant-funeral-costs-paid',
                            true
                        ],
                        ['|role.all', 'rep', 'noauthority', 'deceased']
                    ],
                    data: {
                        templateId: '0ce7f91a-ae1d-4bf4-bfec-64ed0019e93d',
                        phoneNumber:
                            '||/answers/p-rep-confirmation-method/q-rep-telephone-number||',
                        personalisation: {
                            content:
                                'Your bereavement application reference number is ||/answers/system/case-reference||. \nYour funeral application reference number is ||/answers/system/secondary-reference||.'
                        },
                        reference: null
                    }
                }
            ]
        },
        attributes: {
            'q-applicant-physical-injuries': {
                title: 'What was injured?'
            }
        }
    },
    attributes: {
        q__roles: {
            proxy: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'A type of proxy for the applicant e.g. mainapplicant, rep',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                        'someone-else'
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            myself: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Myself journey role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                        'myself'
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            child: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Child applicant role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                        false
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            adult: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Adult applicant role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                        true
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            mainapplicant: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Main Applicant role',
                    type: 'boolean',
                    const: [
                        'or',
                        ['==', '$.answers.p-mainapplicant-parent.q-mainapplicant-parent', true],
                        ['==', '$.answers.p--has-legal-authority.q--has-legal-authority', true]
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            rep: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Rep role',
                    type: 'boolean',
                    const: [
                        'or',
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                'someone-else'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p-mainapplicant-parent.q-mainapplicant-parent',
                                false
                            ],
                            ['==', '$.answers.p--has-legal-authority.q--has-legal-authority', false]
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                'someone-else'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                true
                            ],
                            [
                                '==',
                                '$.answers.p--has-legal-authority.q--has-legal-authority',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                true
                            ]
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                'someone-else'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                true
                            ],
                            [
                                '==',
                                '$.answers.p--has-legal-authority.q--has-legal-authority',
                                false
                            ],
                            [
                                '==',
                                '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                false
                            ]
                        ],
                        [
                            'and',
                            [
                                '==',
                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                'someone-else'
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                true
                            ],
                            [
                                '==',
                                '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                true
                            ]
                        ]
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            noauthority: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'no authority role',
                    type: 'boolean',
                    const: [
                        'and',
                        [
                            '==',
                            '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                            true
                        ],
                        [
                            '==',
                            '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                            false
                        ],
                        ['==', '$.answers.p--has-legal-authority.q--has-legal-authority', false],
                        [
                            '==',
                            '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                            false
                        ]
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            incapable: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'incapable role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                        false
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            capable: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'capable role',
                    type: 'boolean',
                    const: [
                        'or',
                        [
                            '==',
                            '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                            true
                        ],
                        [
                            '==',
                            '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                            'myself'
                        ]
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            authority: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Legal authority role',
                    type: 'boolean',
                    const: [
                        'or',
                        ['==', '$.answers.p--has-legal-authority.q--has-legal-authority', true],
                        [
                            '==',
                            '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                            true
                        ]
                    ],
                    examples: [true, false],
                    invalidExamples: [{}]
                }
            },
            deceased: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Deceased role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-fatal-claim.q-applicant-fatal-claim',
                        true
                    ],
                    examples: [true, false],
                    invalidExamples: [{}]
                }
            },
            nonDeceased: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Non Deceased journey role',
                    type: 'boolean',
                    const: [
                        '==',
                        '$.answers.p-applicant-fatal-claim.q-applicant-fatal-claim',
                        false
                    ],
                    examples: [true, false],
                    invalidExamples: [{}]
                }
            },
            childUnder12: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'child under the age of 12',
                    type: 'boolean',
                    const: [
                        'dateCompare',
                        '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                        '<',
                        '-12',
                        'years'
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            childOver12: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'child over the age of 12',
                    type: 'boolean',
                    const: [
                        'dateCompare',
                        '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                        '>=',
                        '-12',
                        'years'
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            },
            noContactMethod: {
                schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'has no email or text contact method',
                    type: 'boolean',
                    const: [
                        'or',
                        [
                            '==',
                            '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                            'none'
                        ],
                        [
                            '==',
                            '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                            'none'
                        ],
                        [
                            '==',
                            '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                            'none'
                        ]
                    ],
                    examples: [{}],
                    invalidExamples: [{}]
                }
            }
        }
    }
};
