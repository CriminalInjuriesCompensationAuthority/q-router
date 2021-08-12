# __q-router__

Provides methods for navigating a questionnaire based on defined routing rules

# Operators

## __dateCompare__ <sup>*`added: v2.6.0`*</sup>

Compares two dates and returns `true` if supplied condition in met. Otherwise `false` in returned. If the second date is not supplied, it defaults to the current date.

Take two dates, get the difference, then compare that difference to the supplied `comparison operator` (row 3 below), and the `number of units` (defined in rows 3, and 4 below).

### __Rule definition__
The rule array for this operator has 6 items defined:

| Item No. | Name                     | value                       | type     | Required | Default      |
|----------|--------------------------|-----------------------------|----------|----------|--------------|
| 1        | Operator name            | 'dateCompare'               | `String` | Yes      | N/A          |
| 2        | LHS Date                 | `ISO 8601 Date`             | `Date`   | Yes      | N/A          |
| 3        | Date difference comparison operator | '>', '<', '=', '<=', or '>='               | `String` | Yes      | '>'          |
| 4        | Number of units          | Signed Integer              | `Number` | Yes      | N/A          |
| 5        | Unit of time             | 'Years', 'months', etc. <sup>[`1`](#rule1)</a></sup> | `String` | Yes      | 'years'      |
| 6        | RHS Date                 | `ISO 8601 Date`             | `Date`   | No       | `new Date()` |

<a name="rule1">[1]</a> Full list defined [here](https://momentjs.com/docs/#/displaying/difference/)

---

### __Example usage__
#### Example 1
If you wanted to route based on the following:

You want to ask a user what their favourite film is. The specific film question is dependant on the user's age. They will get asked about their favourite Disney film if they are 14 years old or less. Otherwise, they will be asked what their favourite Netflix show is.

Pseudo-code:
> Go to `p-ns-favourite-disney-film` if the answer to `p-ns-date-of-birth` is less than 15 years ago from today. Otherwise, route to `p-ns-favourite-netflix-show`.

```js
if (diff between `p-ns-date-of-birth` and today) < 15 years
    route to `p-ns-favourite-disney-film`
else
    route to `p-ns-favourite-netflix-show`
```

As a rule this would be represented like this:
```js
routes: {
    ...
    states: {
        'p-ns-date-of-birth': {
            on: {
                ANSWER: [
                    {
                        target: 'p-ns-favourite-disney-film',
                        cond: [
                            'dateCompare',
                            '$.answers.p-ns-date-of-birth.q1', // this date...
                            '<', // is less than...
                            '-15', // 15 ...
                            'years', // years before - (before, due to the negative (-15) ...
                            // today. No sixth item, defaults to today's date.
                        ]
                    },
                    {
                        target: 'p-ns-favourite-netflix-show'
                    }
                ]
            }
        },
        'p-ns-favourite-disney-film': {},
        'p-ns-favourite-netflix-show': {}
        ...
    }
}
```