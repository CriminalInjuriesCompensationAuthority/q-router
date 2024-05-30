'use strict';

const config = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    globals: {
        structuredClone: val => JSON.parse(JSON.stringify(val))
    }
};

module.exports = config;
