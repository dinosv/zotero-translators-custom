{
	"translatorID": "de993663-881a-44d5-b1e1-d486275a694c",
	"label": "ISP Chile - Registro Sanitario",
	"creator": "Claude Code",
	"target": "^https?://registrosanitario\\.ispch\\.gob\\.cl/Ficha\\.aspx\\?RegistroISP=",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-12-08 00:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2025 Claude Code

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.includes('Ficha.aspx?RegistroISP=')) {
		return 'webpage';
	}
	return false;
}

function doWeb(doc, url) {
	scrape(doc, url);
}

function scrape(doc, url) {
	var item = new Zotero.Item('webpage');

	// Extract registration number from URL
	var registroMatch = url.match(/RegistroISP=([^&]+)/);
	var registroISP = registroMatch ? decodeURIComponent(registroMatch[1]) : '';

	// Try to get product name from page
	// ASP.NET pages typically use spans with specific IDs
	var productName = '';

	// Try multiple selectors for product name
	var nameSelectors = [
		'#ctl00_ContentPlaceHolder1_lblNombre',
		'span[id*="lblNombre"]',
		'td:contains("Nombre") + td',
		'.nombre-producto'
	];

	for (var i = 0; i < nameSelectors.length; i++) {
		var elem = doc.querySelector(nameSelectors[i]);
		if (elem && elem.textContent.trim()) {
			productName = ZU.trimInternal(elem.textContent);
			break;
		}
	}

	// If no product name found, try to extract from page text
	if (!productName) {
		// Look for text patterns in the page
		var bodyText = doc.body ? doc.body.textContent : '';

		// Try to find product name near "Nombre" label
		var nombreMatch = bodyText.match(/Nombre[:\s]+([^\n\r]+)/i);
		if (nombreMatch) {
			productName = ZU.trimInternal(nombreMatch[1]);
		}
	}

	// Build title similar to RIS format
	if (productName && registroISP) {
		item.title = 'Ficha registro ' + registroISP + '  ' + productName;
	} else if (registroISP) {
		item.title = 'Ficha registro ' + registroISP;
	} else if (productName) {
		item.title = productName;
	} else {
		// Fallback to page title
		item.title = doc.title || 'Registro Sanitario ISP Chile';
	}

	// Set author as institution
	item.creators.push({
		lastName: 'Instituto de Salud Pública',
		creatorType: 'author',
		fieldMode: 1
	});

	// Set URL
	item.url = url;

	// Set website title
	item.websiteTitle = 'Registro Sanitario - Instituto de Salud Pública de Chile';

	// Set access date
	var now = new Date();
	item.accessDate = now.toISOString().split('T')[0];

	// Try to extract additional metadata

	// Titular/Holder
	var titularElem = doc.querySelector('#ctl00_ContentPlaceHolder1_lblTitular, span[id*="lblTitular"]');
	if (titularElem && titularElem.textContent.trim()) {
		item.extra = (item.extra || '') + 'Titular: ' + ZU.trimInternal(titularElem.textContent) + '\n';
	}

	// Registration date
	var fechaElem = doc.querySelector('#ctl00_ContentPlaceHolder1_lblFechaInscripcion, span[id*="lblFecha"]');
	if (fechaElem && fechaElem.textContent.trim()) {
		item.extra = (item.extra || '') + 'Fecha inscripción: ' + ZU.trimInternal(fechaElem.textContent) + '\n';
	}

	// Estado del registro
	var estadoElem = doc.querySelector('#ctl00_ContentPlaceHolder1_lblEstado, span[id*="lblEstado"]');
	if (estadoElem && estadoElem.textContent.trim()) {
		item.extra = (item.extra || '') + 'Estado: ' + ZU.trimInternal(estadoElem.textContent) + '\n';
	}

	// Principio activo
	var principioElem = doc.querySelector('#ctl00_ContentPlaceHolder1_lblPrincipioActivo, span[id*="lblPrincipio"]');
	if (principioElem && principioElem.textContent.trim()) {
		item.extra = (item.extra || '') + 'Principio activo: ' + ZU.trimInternal(principioElem.textContent) + '\n';
	}

	// Add registro ISP as identifier in extra
	if (registroISP) {
		item.extra = (item.extra || '') + 'Registro ISP: ' + registroISP + '\n';
	}

	// Clean up extra field (remove trailing newline)
	if (item.extra) {
		item.extra = item.extra.trim();
	}

	// Add snapshot
	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://registrosanitario.ispch.gob.cl/Ficha.aspx?RegistroISP=B-2933/22",
		"items": [
			{
				"itemType": "webpage",
				"title": "Ficha registro B-2933/22  TRESIBA SOLUCIÓN INYECTABLE 100 U/mL (INSULINA DEGLUDEC)",
				"creators": [
					{
						"lastName": "Instituto de Salud Pública",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"websiteTitle": "Registro Sanitario - Instituto de Salud Pública de Chile",
				"url": "https://registrosanitario.ispch.gob.cl/Ficha.aspx?RegistroISP=B-2933/22",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
