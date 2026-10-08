---
title: "About"
nav: "About"
categories: ["about"]
menu: topnav
weight: 40
---
Idalina Insfrán  

Perito Informático

Matrícula CSJ Nº 5736

Email: insfran@tuta.io  

PGP:  
```text
-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: User ID:	Idalina Insfrán <insfran@tuta.io>
Comment: Valid from:	3/10/26 8:04 a. m.
Comment: Valid until:	3/10/27 11:58 p. m.
Comment: Type:	255-bit EdDSA (secret key available)
Comment: Usage:	Signing, Encryption, Certifying User IDs
Comment: Fingerprint:	026B F739 382A 9373 608D  0E94 C9E3 06C7 5088 DDE2

mDMEasDhTxYJKwYBBAHaRw8BAQdAKwYsv6E4/OmRjQMSd7N6BqbfgjK04E9IEDfT
pEjc6Hm0IklkYWxpbmEgSW5zZnLDoW4gPGluc2ZyYW5AdHV0YS5pbz6IlgQTFgoA
PgIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgBYhBAJr9zk4KpNzYI0OlMnjBsdQ
iN3iBQJqwOGSBQkB4hMkAAoJEMnjBsdQiN3i3xAA/1xGIuoBQiG4PDt7YKBR6wof
dBm4RuHOMpedthADAI6cAP9lacMKA/5M42wdckcep2O3/JsrT2a8Mpf/+5nUM5Ai
A7g4BGrA4U8SCisGAQQBl1UBBQEBB0Aw5zBS5Dhip3m9fRSFkCF+EHEcat7AX500
9N7VrQMZFAMBCAeIfgQYFgoAJgIbDBYhBAJr9zk4KpNzYI0OlMnjBsdQiN3iBQJq
wOGSBQkB4hMkAAoJEMnjBsdQiN3iv8YBAJUwenQ3Dw8y+qt9FeLSyWyBjf7caeWa
al7wPWwAww+6AQCqeIx2jJ9/2Y+HK2Vf+C0vrvbVqCjhQOm/+CdCVVRCCw==
=/LYb
-----END PGP PUBLIC KEY BLOCK-----
```
## Direct Message

The message writing in the next form will arrive at my mobile instantly.

<style>
  #ntfy-box {
    max-width: 500px;
    margin: 1.5rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: inherit;
    font-size: 80%;
  }
  #ntfy-box input,
  #ntfy-box textarea {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 4px;
    font: inherit;
  }
  #ntfy-box textarea {
    min-height: 90px;
    resize: vertical;
  }
  #ntfy-box button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #333;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }
  #ntfy-box button:hover {
    background: #555;
  }
  #ntfy-estado {
    margin: 0.75rem 0 0;
    min-height: 1.2em;
  }
</style>

<div id="ntfy-box">
  <input type="text" id="ntfy-titulo" placeholder="Title">
  <textarea id="ntfy-mensaje" placeholder="Note: Don't forget to include a way to contact you: mobile, e-mail..."></textarea>
  <button id="ntfy-enviar">Send it!</button>
  <p id="ntfy-estado"></p>
</div>

<script>
  const TEMA = '5hPJsf0aIA'; // cambialo por un nombre difícil de adivinar

  document.getElementById('ntfy-enviar').addEventListener('click', async () => {
    const titulo = document.getElementById('ntfy-titulo').value;
    const mensaje = document.getElementById('ntfy-mensaje').value;
    const estado = document.getElementById('ntfy-estado');

    try {
      const r = await fetch('https://ntfy.sh/' + TEMA, {
        method: 'POST',
        body: mensaje,
        headers: { 'Title': titulo }
      });
      estado.textContent = r.ok ? 'Enviado ✔' : 'Error: ' + r.status;
    } catch (e) {
      estado.textContent = 'No se pudo enviar';
    }
  });
</script>