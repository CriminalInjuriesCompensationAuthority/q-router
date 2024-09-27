'use strict';

process.env.APP_ENV = 'test';

global.structuredClone = val => {
    return JSON.parse(JSON.stringify(val));
};
