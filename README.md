<!--*-tab-length:6;indent-tabs-mode:t;-*--------------- vim:set ts=6:-->

Alhadis's record collection
========================================================================

> [!NOTE]
> Don't confuse this repository with [Record-Jar][]. There's unlikely to
> be anything of interest to you here, unless you're in the market for a
> really obscure/OOP metal/noise/industrial record.[^1]

Stuff for managing what remains of my record collection, and scripts for
automating pre-sale steps that I logically can't do after I've posted an
item to a buyer on [eBay][].

(This repository also doubles as an excuse to dabble in XSLT, which I've
minimal exposure to).


Checklist
========================================================================

* [ ] Rip CD in WAV quality using [`rip-cd.sh`][]
* [ ] Submit disc ID to MusicBrainz
* [ ] Submit AcoustID fingerprint(s)
	* [ ] Submit CD info to Gracenote if I'm feeling generous
* [ ] Scan covers, sleeve inserts, traycards, discs, etc  
	(Remember to scan all 9 brightness/darkness levels!)
* [ ] Type up any info available from the physical release:
	* [ ] Production info, credits, liner notes, lyrics
	* [ ] Barcodes, matrix numbers, mould IDs, et al.
* [ ] List on [eBay][]
	* [ ] Take photos


Footnotes
------------------------------------------------------------------------
Most of these steps require OpenBSD,[^2] which has [Picard][] available
for submitting most of the disc-dependent details to MusicBrainz (i.e.,
ones that require a physical copy on-hand).

[^1]: Yet I've documented this fucking repository as if it's prepped for
	Debian distribution or something. Look at this goddamn brick-text.
[^2]:	Specifically, its wonderfully ergonomic [`cdio(1)`][] utility.
	(What the hell is Exact Audio Copy, anyway?)

<!-- Referenced links ------------------------------------------------->
[eBay]:        https://www.ebay.com/usr/alhadis
[Picard]:      https://musicbrainz.org/doc/Picard
[`cdio(1)`]:   https://man.openbsd.org/cdio.1
[`rip-cd.sh`]: ./rip-cd.sh
