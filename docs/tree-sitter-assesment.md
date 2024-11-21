# Tree sitter Vs. ohm-js

## Advantages

* Parse output even with errors
* Faster real time updation and re-parsing
* Bindings available for other langauges like python too
* Allows querying of tree, which might come use full for us to extract specific contents like Notes, esb etc
* Faciliates syntax highlighting setups
* Has in-built testing facilities

## Challenges

* While copying the existing grammar in OHM, features like look ahead and parameterized rules are missing. So need to figure out how to best realize those rules here
* OHM  follows a topdown parsing approach where as tree-sitter follows a bottom up approach. So, it might require us to re-write the whole grammar in a different way to suit how the new tool works(There is considerable difference in how both the tools handle rule precedence, associativity, whitespace handling etc).
* Parse output is a tree, need to write conversion from tree output to JSON from scratch which might become as complex as wrting the grammar itself.
* If we provide interfaces in multiple languages, tree to JSON conversion will have to be re written in all those languages and maintained parallelly.
* The whole test set may have to be re-written according to the tree-sitter in-built testing mechanisms, which tests agianst the tree output not the final JSON structure.


