# Kokolores – Website-Neubau

Statische Neuauflage von kokolores.de (Jugendkulturverein Kokolores Künzelsau e.V.).
Kein Build nötig – `index.html` einfach im Browser öffnen oder den Ordner auf einen beliebigen Webspace hochladen.

- `index.html` – Startseite mit Events, Team, Einblicke, Kontakt
- `impressum.html`, `datenschutz.html` – Rechtstexte
- `style.css`, `main.js` – Design und Funktionen
- `assets/` – Bilder und selbst gehostete Schriften (Poppins, Inter; SIL Open Font License)

## Neues Event eintragen

In `index.html` im Block `<div class="events" id="event-list">` einen `<article class="card event">` kopieren
und Datum (`data-date="JJJJ-MM-TT"`), Monat/Tag/Jahr, Titel und Text anpassen.
Vergangene Events werden automatisch ausgeblendet, das nächste wird markiert.

## Kontaktformular

Die Seite hat kein Backend: Das Formular prüft die Eingaben und öffnet dann das E-Mail-Programm
mit fertiger Nachricht an vorstand@ bzw. booking@kokolores.de.
