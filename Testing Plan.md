# Testing Plan

## Mandatory Markers
Check for the presence of the mandatory markers without which a USFM file will not be valid.

* id
* c
* p
* v
	
## Marker Wise Syntax
Check the behaviour of the parser/validator are proper under these situations where internal structure of a marker needs to be validated

* The markers with/without certain arguments where its optional
* Markers without arguments, when given one
* Markers taking *n* arguments, when given *n+1*
* Two non-nesting markers on same line
* Footnotes and cross-references when not closed properly
* *id* with the 3 letter book code in not proper format


## Document Structure
There is a somewhat loose structure defined for a valid USFM file. Check for these criteria

* starts with an id
* ide comes just beneath id, if present
* All the following markers come before *chapter* start(*c*) and after *identification* 
> * mt#
> * mte#
> * h
> * imt#
> * is#
> * ip
> * ipi
> * im
> * imi
> * ipq
> * imq
> * ipr
> * iq#
> * ib
> * ili
> * iot
> * io#
> * imte#
> * iex
> * cl

* ca..ca\* comes just beneath *c*, if present
* The following markers occur after *chapter* start and before *parapgraph* start
> * ms#
> * mr
> * s#
> * sr
> * r
> * d
> * cl
> * cd


* There will be one or more *p* after a *c*
* There will be one or more *v* after a *p*
* Markers possible after(within) *v* and considered inline
> * rq...\*rq
> * q#
> * va...\*va
> * vp...\*vp

* Markers that occurs within *p* along with *v*
> * sp
> * sd#
> * iex

* There are markers that occur within text content of parent markers(**In-line**) 
> * ior...ior\* within the *io#* text
> * va...va\* within *v*
> * vp...vp\* within *v*
> * bk

## Parse Structure
Ensure that the struture is paresed correctly to the required JSON structure

* The id, ide tags come within *identification* section
* The  markers go to their repective *introduction, title, heading and label* sections
* *Chapter* becomes a parent object enclosing *sections,paragraphs*



