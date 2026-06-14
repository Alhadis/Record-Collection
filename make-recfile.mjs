#!/usr/bin/env node --no-deprecation

import {readFileSync} from "fs";
import {JSDOM} from "./node_modules/jsdom/lib/api.js";

class Inventory{
	#doc         = null;
	#items       = [];
	#artists     = [];
	#artistsById = {__proto__: null};
	
	constructor(src){
		const doc = new DOMParser().parseFromString(src, "text/xml");
		this.#doc = doc.documentElement;
		this.#getArtists();
		this.#getItems();
	}
	
	#getRefs(node, target){
		for(const ref of node.querySelector(":scope > refs").children)
			switch(ref.nodeName){
				case "bc":
					const album = ref.getAttribute("album");
					const track = ref.getAttribute("track");
					target.BandcampID   = ref.textContent;
					target.BandcampType = track
						? "track"
						: album ? "album" : "band";
					break;
				case "discogs":
					target.DiscogsID   = +ref.textContent;
					target.DiscogsType = ref.getAttribute("type") || "artist";
					break;
				case "ma":
					target.MetalArchivesID   = +ref.textContent;
					target.MetalArchivesType = ref.getAttribute("type") || "band";
					break;
				case "mbid": target.MBID     = `{${ref.textContent}}`; break;
				case "rym":  target.RYM      = ref.textContent;        break;
				case "wd":   target.WikiData = ref.textContent;        break;
				case "fb":   target.FBID     = +ref.textContent;       break;
				default:
					throw new TypeError(`Unknown node: ${ref.nodeName}`);
			}
		return target;
	}

	#getArtists(){
		for(const node of this.#doc.querySelectorAll("inventory > artists > artist")){
			const id   = node.getAttribute("xml:id");
			const name = node.querySelector(":scope > name");
			if(!id)   throw new TypeError(`Missing required ID field: ${node.outerHTML}`);
			if(!name) throw new TypeError(`Missing required name field: ${node.outerHTML}`);
			
			const artist = {ID: id, Name: name.textContent};
			const country = node.querySelector(":scope > country");
			if(null != country){
				artist.Country = country.textContent;
				const region = country.getAttribute("region");
				if(null != region)
					artist.Region = region;
			}
			this.#getRefs(node, artist);
			this.#artists.push(artist);
			this.#artistsById[id] = artist;
		}
	}
	
	#getItems(){
		for(const node of this.#doc.querySelectorAll("inventory > items > item")){
			if(node.querySelectorAll(":scope > version").length > 1)
				continue; // CBF implementing

			const names   = node.querySelectorAll(":scope > release name");
			const note    = node.querySelector(":scope > note");
			const price   = node.querySelector(":scope > price");
			const format  = node.querySelector(":scope > release format");
			const copies  = node.querySelector(":scope > release copies");
			const item    = {
				Title:  [...names].map(n => n.textContent).join(" / "),
				Artist: [],
				Format: format.textContent,
			};
			if(note)   item.Note   = note.textContent;
			if(copies) item.Copies = +copies.textContent;
			if(price)  item.Price  = parseFloat(price.textContent);
			
			for(const artist of node.querySelectorAll("artist")){
				const ref = artist.getAttribute("ref");
				if(null != ref){
					const artist = this.#artistsById[ref];
					if(!artist)
						throw new ReferenceError(`Undefined artist: ${ref}`);
					item.Artist.push(ref);
				}
			}
			this.#items.push(item);
		}
	}
	
	#stringify(list){
		let str = "";
		for(const entry of list){
			for(const key in entry){
				let value = entry[key];
				value = Array.isArray(value) ? value : [value];
				for(const entry of value)
					str += key + ": " + entry + "\n";
			}
			str += "\n";
		}
		return str;
	}

	toString(){
		return String.raw `
			%rec: Artist
			%doc: List of recording artists who produced listed recordings.
			%typedef: ID regexp /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/
			%mandatory: ID Name
			%key: ID
			%type: ID ID
			%type: Name line
			%type: Country regexp /^[A-Z]{2}$/
			%type: BandcampID ID
			%type: BandcampType enum band album track
			%type: DiscogsID int
			%type: DiscogsType enum artist label master release
			%type: FBID int
			%type: MetalArchivesID int
			%type: MetalArchivesType enum band artist release label
			%type: MBID uuid
			%type: RYM ID
			%type: WikiData regexp /^Q\d+$/
		`.trim().replace(/^\s+/gm, "") + "\n\n"
		+ this.#stringify(this.#artists)
		+ String.raw `
			%rec: Item
			%doc: Musical records listed for sale on eBay.
			%mandatory: Title
			%type: Title line
			%type: Copies int
			%type: Price real
			%type: Artist rec Artist
			%type: Format enum CD Cassette 7-inch 10-inch 12-inch
			%type: BandcampID ID
			%type: BandcampType enum band album track
			%type: DiscogsID int
			%type: DiscogsType enum artist label master release
			%type: FBID int
			%type: MetalArchivesID int
			%type: MetalArchivesType enum band artist release label
			%type: MBID uuid
			%type: RYM ID
			%type: WikiData regexp /^Q\d+$/
		`.trim().replace(/^\s+/gm, "") + "\n\n"
		+ this.#stringify(this.#items);
	}
}

const {DOMParser} = new JSDOM().window;
const inventory = new Inventory(readFileSync("./record-collection.xml", "utf8"));

process.stdout.write(inventory.toString());
