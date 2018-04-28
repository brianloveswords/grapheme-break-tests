# grapheme-break-tests

## What is this?

A big pile of JSON that you can use to generate test cases for breaking on
[grapheme cluster boundaries](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries).

A description of each files follows.

### grapheme-break-tests.txt

The raw file of tests as provided by Unicode, Inc, originally downloaded from the following url: https://www.unicode.org/Public/UCD/latest/ucd/auxiliary/GraphemeBreakTest.txt


grapheme-tests.txt falls under the Unicode license agreement, see http://www.unicode.org/terms_of_use.html

### grapheme-break-tests.json

A json file containing an array of cases derived from **grapheme-break-tests.txt**.


| field  | type  | description  |
|---|---|---|
| description  | string  | description of the test case  |
| input  | string  | input for the test case  |
| output  | string[]  | expected output if the input were broken into array items at each breakpoint opportunity |

#### Example

 ``` json
    {
        "description": "÷ [0.2] WHITE UP POINTING INDEX (E_Base) × [10.0] EMOJI MODIFIER FITZPATRICK TYPE-1-2 (E_Modifier) ÷ [999.0] WHITE UP POINTING INDEX (E_Base) ÷ [0.3]",
        "input": "☝🏻☝",
        "output": [
            "☝🏻",
            "☝"
        ]
    }

```


### grapheme-break-tests-bytes.json

In case your language of choice throws up on the raw strings containing all manner of unicode, here's the same shit instead with ✨byte arrays✨

| field  | type
|---|---|
| description  | string |
| input  | byte[]  |
| output  | byte[][]  |


``` json
    {
        "description": "÷ [0.2] WHITE UP POINTING INDEX (E_Base) × [10.0] EMOJI MODIFIER FITZPATRICK TYPE-1-2 (E_Modifier) ÷ [999.0] WHITE UP POINTING INDEX (E_Base) ÷ [0.3]",
        "input": [
            226,
            152,
            157,
            240,
            159,
            143,
            187,
            226,
            152,
            157
        ],
        "output": [
            [
                226,
                152,
                157,
                240,
                159,
                143,
                187
            ],
            [
                226,
                152,
                157
            ]
        ]
    }
```


### grapheme-break-test-parser.js

The garbage code I wrote to generate these files from **grapheme-break-tests.txt**. I wasn't initially expecting to open source this when I wrote this and it was gonna be throwaway code so it's pretty gnarly, but like using pens as chopsticks to eat gas station ramen you made using the coffee maker in your America's Best Value Inn motel room because your flight landed at 11pm and nothing stays open late in Mountain View but you're starving, it _gets the job done_.


## License

**grapheme-tests.txt** falls under the Unicode license agreement, see http://www.unicode.org/terms_of_use.html

the rest of this bullshit is GPL 3.0
