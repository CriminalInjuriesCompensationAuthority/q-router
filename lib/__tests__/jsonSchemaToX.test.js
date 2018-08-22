const jsonSchemaToX = require('../index.js');
const booleanSchema = require('../schemas/boolean.json');
const checkboxSchema = require('../schemas/checkboxes.json');
const radioSchema = require('../schemas/radios.json');
const diff = require('jest-diff');

expect.extend({
    // https://github.com/facebook/jest/blob/master/packages/expect/src/matchers.js#L365
    toMatchFixture(received, expected) {
        const MULTILINE_REGEXP = /[\r\n]/;
        const indentation = /^\s+/gm;

        // https://github.com/facebook/jest/blob/master/packages/expect/src/utils.js#L254
        function isOneline(expected, received) {
            return (
                typeof expected === 'string' &&
                typeof received === 'string' &&
                (!MULTILINE_REGEXP.test(expected) || !MULTILINE_REGEXP.test(received))
            );
        }

        const receivedStrippedIndentation = received.replace(indentation, '');
        const expectedStrippedIndentation = expected.replace(indentation, '');

        // const pass = this.equals(received, expected);
        const pass = this.equals(receivedStrippedIndentation, expectedStrippedIndentation);
        const message = pass
            ? () =>
                  `${this.utils.matcherHint('.not.toEqual')}\n\n` +
                  `Expected value with indentation removed to equal:\n` +
                  `  ${this.utils.printExpected(expectedStrippedIndentation)}\n` +
                  `Received value with indentation removed:\n` +
                  `  ${this.utils.printReceived(receivedStrippedIndentation)}`
            : () => {
                  const oneline = isOneline(expected, received);
                  const diffString = diff(
                      expectedStrippedIndentation,
                      receivedStrippedIndentation,
                      { expand: this.expand }
                  );
                  return (
                      `${this.utils.matcherHint('.toEqual')}\n\n` +
                      `Expected value with indentation removed to equal:\n` +
                      `  ${this.utils.printExpected(expectedStrippedIndentation)}\n` +
                      `Received value with indentation removed:\n` +
                      `  ${this.utils.printReceived(receivedStrippedIndentation)}${
                          diffString && !oneline ? `\n\nDifference:\n\n${diffString}` : ''
                      }`
                  );
              };
        // Passing the the actual and expected objects so that a custom reporter
        // could access them, for example in order to display a custom visual diff,
        // or create a different error message
        return { actual: received, expected, message, name: 'toEqual', pass };
    }
});

describe('jsonSchemaToX', () => {
    it('should convert a json schema representing a boolean value in to a form radios', () => {
        const output = `
            <div class="govuk-form-group">
                <fieldset class="govuk-fieldset" aria-describedby="changed-name-hint">
                <legend class="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 class="govuk-fieldset__heading">
                        Have you changed your name?
                    </h1>
                </legend>
                <span id="changed-name-hint" class="govuk-hint">
                    This includes changing your last name or spelling your name differently.
                </span>
                <div class="govuk-radios govuk-radios--inline">
                    <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="changed-name-1" name="changed-name" value="yes" type="radio">
                        <label class="govuk-label govuk-radios__label" for="changed-name-1">
                            Yes
                        </label>
                    </div>
                    <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="changed-name-2" name="changed-name" value="no" type="radio">
                        <label class="govuk-label govuk-radios__label" for="changed-name-2">
                            No
                        </label>
                    </div>
                </div>
                </fieldset>
            </div>
        `;

        expect(jsonSchemaToX.toForm(booleanSchema)).toMatchFixture(output);
    });

    it('should convert a json schema representing a multiple values in to a form checkboxes', () => {
        const output = `
            <div class="govuk-form-group">
                <fieldset class="govuk-fieldset" aria-describedby="nationality-hint">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 class="govuk-fieldset__heading">
                            What is your nationality?
                        </h1>
                    </legend>
                    <span id="nationality-hint" class="govuk-hint">
                        If you have dual nationality, select all options that are relevant to you.
                    </span>
                    <div class="govuk-checkboxes">
                        <div class="govuk-checkboxes__item">
                            <input class="govuk-checkboxes__input" id="nationality-1" name="nationality" value="british" type="checkbox">
                            <label class="govuk-label govuk-checkboxes__label" for="nationality-1">
                                British
                            </label>
                        </div>
                        <div class="govuk-checkboxes__item">
                            <input class="govuk-checkboxes__input" id="nationality-2" name="nationality" value="irish" type="checkbox">
                            <label class="govuk-label govuk-checkboxes__label" for="nationality-2">
                                Irish
                            </label>
                        </div>
                        <div class="govuk-checkboxes__item">
                            <input class="govuk-checkboxes__input" id="nationality-3" name="nationality" value="other" type="checkbox">
                            <label class="govuk-label govuk-checkboxes__label" for="nationality-3">
                                Citizen of another country
                            </label>
                        </div>
                    </div>
                </fieldset>
            </div>
        `;

        expect(jsonSchemaToX.toForm(checkboxSchema)).toMatchFixture(output);
    });

    it('should convert a json schema representing a multiple values in to a form radios', () => {
        const output = `
            <div class="govuk-form-group">
                <fieldset class="govuk-fieldset">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 class="govuk-fieldset__heading">
                            Where do you live?
                        </h1>
                    </legend>
                    <div class="govuk-radios">
                        <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="where-do-you-live-1" name="where-do-you-live" value="england" type="radio">
                            <label class="govuk-label govuk-radios__label" for="where-do-you-live-1">
                                England
                            </label>
                        </div>
                        <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="where-do-you-live-2" name="where-do-you-live" value="scotland" type="radio">
                            <label class="govuk-label govuk-radios__label" for="where-do-you-live-2">
                                Scotland
                            </label>
                        </div>
                        <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="where-do-you-live-3" name="where-do-you-live" value="wales" type="radio">
                            <label class="govuk-label govuk-radios__label" for="where-do-you-live-3">
                                Wales
                            </label>
                        </div>
                        <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="where-do-you-live-4" name="where-do-you-live" value="northern-ireland" type="radio">
                            <label class="govuk-label govuk-radios__label" for="where-do-you-live-4">
                                Northern Ireland
                            </label>
                        </div>
                    </div>
                </fieldset>
            </div>
        `;

        expect(jsonSchemaToX.toForm(radioSchema)).toMatchFixture(output);
    });
});
