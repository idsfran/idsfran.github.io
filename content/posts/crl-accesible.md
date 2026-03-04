---
title: "CRL: ¿Accesible al público?."
description: "Lo que es Accesible"
tags: ["validación", "blockchain", "pki", "firma digital", "tecnologia"]
draft: false
date: 2025-09-25
slug: "servicios-de-confianza"
---

Este artículo examina el papel de las Listas de Revocación de Certificados (CRL, por sus siglas en inglés) y por qué su publicación, aunque obligatoria, no siempre equivale a un servicio accesible y práctico para el público general. La distinción no es menor: de ella depende la posibilidad real de verificar la validez de documentos firmados digitalmente.

## Lo que dice la ley.

La norma vigente establece con precisión:

> 2. Los prestadores de servicios de confianza que expidan certificados electrónicos, deben cumplir también las siguientes obligaciones:
> a) No almacenar ni copiar, ...
> (...)
> b) Disponer de un servicio de consulta sobre el estado de validez y revocación de los certificados emitidos accesible al público.

El término determinante es **accesible**. La disposición no exige la mera publicación de un archivo técnico, sino la habilitación de un *servicio de consulta* que cualquier persona pueda utilizar sin conocimientos especializados. Esta distinción es la que, en la práctica, se ignora con mayor frecuencia.

La legislación local se inscribe en una tendencia internacional cuyo referente más consolidado es el **Reglamento eIDAS** de la Unión Europea (Reglamento UE 910/2014), que regula los servicios de confianza electrónica y establece estándares de supervisión y accesibilidad equivalentes [^1]. La premisa de fondo es uniforme: la confianza en los documentos electrónicos exige que cualquier parte interesada —no solo los técnicos— pueda verificar la validez de una firma.

## Un poco de contexto: qué es un certificado digital y por qué puede revocarse.

Una firma digital no es una imagen ni un trazo escaneado. Es el resultado de una operación criptográfica que involucra un **certificado digital**: un archivo emitido por una autoridad certificadora —el Prestador de Servicios de Confianza, o PSC— que vincula la identidad del firmante con una clave criptográfica única.

Como un documento de identidad, ese certificado tiene fecha de vencimiento. Pero también puede **revocarse antes de su expiración** por razones contempladas en los estándares de Infraestructura de Clave Pública (PKI, *Public Key Infrastructure*) [^2]:

- **Compromiso de la clave privada**: acceso no autorizado a la clave del titular.
- **Cambio de afiliación**: el titular deja una organización y su certificado pierde vigencia institucional.
- **Error en la emisión**: el PSC cometió un error al emitirlo.
- **Solicitud del titular**: el propio firmante solicita su cancelación.

Cuando un certificado es revocado, el PSC tiene la obligación de publicar esa información. De no hacerlo —o de hacerlo de forma inaccesible—, quien recibe un documento firmado con ese certificado no tiene manera práctica de conocer su estado real.

## CRL y OCSP: dos mecanismos, una misma obligación.

Existen dos métodos estándar para consultar el estado de revocación de un certificado, ambos especificados en la familia de estándares X.509 [^3]:

**CRL (Certificate Revocation List)**: Lista emitida y firmada criptográficamente por el PSC que contiene todos los certificados revocados hasta la fecha. Se publica periódicamente y quien desee verificar un certificado debe descargar esa lista completa y comprobar si el número de serie en cuestión figura en ella. Es el método más antiguo y, como se verá, el menos compatible con la accesibilidad pública real.

**OCSP (Online Certificate Status Protocol)**: Protocolo definido en el RFC 6960 que permite consultar el estado de un certificado específico en tiempo real [^4]. En lugar de descargar una lista completa, el sistema de verificación envía una consulta al servidor del PSC y recibe una respuesta inmediata: válido, revocado o desconocido. Es más eficiente, más oportuno y sustancialmente más adecuado para construir servicios de consulta accesibles al público.

Los navegadores modernos utilizan OCSP de forma transparente al verificar certificados de sitios HTTPS. Sin embargo, en el ámbito de la firma de documentos, varios PSCs locales no ofrecen un servicio OCSP públicamente consultable, y menos aún una interfaz web orientada al ciudadano.

## Lo que ocurre en la práctica.

Las bases de datos públicas de los PSCs locales suelen mostrar únicamente los certificados **activos en el momento de la consulta**. Los certificados revocados o expirados no aparecen, lo que genera dos problemas concretos.

El primero es operativo: al intentar verificar la firma de un documento de años anteriores, el software puede no encontrar el certificado correspondiente y arrojar un resultado negativo, aun cuando la firma fuera completamente válida en su momento.

El segundo problema es más serio: **la ausencia de información histórica sobre revocaciones impide determinar si un certificado fue invalidado por razones de seguridad.** Considérese el siguiente caso: un funcionario firma digitalmente una resolución en 2023 con un certificado aparentemente válido. En 2024, ese certificado es revocado porque su clave privada fue comprometida. Si hoy se intenta verificar esa firma a través de los canales oficiales disponibles al público, no hay manera de detectar la revocación. La firma aparenta ser válida; los registros de revocación no están disponibles.

Este escenario no es hipotético. Afecta directamente la trazabilidad de actos administrativos, contratos y documentos con valor legal, y socava la confianza que el sistema de firma digital está precisamente diseñado para generar.

## El cumplimiento formal frente al cumplimiento real.

El CRL sí se publica. Es descargable desde [https://efirma.com.py/repositorio/efirma2.crl](https://efirma.com.py/repositorio/efirma2.crl).

El problema es que se trata de un **archivo binario en formato DER**, no legible directamente. Para interpretarlo se requiere una herramienta técnica como OpenSSL:

```bash
$ openssl crl -inform DER -text -noout -in efirma2.crl -out efirma2.txt
```

Publicar un archivo de estas características y presentarlo como cumplimiento de la obligación de accesibilidad pública es satisfacer la forma de la norma mientras se vacía su contenido. La disposición legal no exige simplemente que exista un archivo; exige un servicio que cualquier persona pueda consultar. La diferencia es sustancial.

Convertido a texto, el CRL presenta una estructura como la siguiente:

```
Certificate Revocation List (CRL):
        Version 2 (0x1)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: serialNumber=RUC80080099-0, CN=VIT S.A., OU=Prestador Cualificado de Servicios de Confianza, O=ICPP, C=PY
        Last Update: Sep 27 18:53:02 2025 GMT
        Next Update: Sep 28 06:53:02 2025 GMT
        CRL extensions:
            X509v3 CRL Number: 
                4100
            X509v3 Authority Key Identifier: 
                BB:65:11:2B:67:ED:86:38:20:1C:28:67:19:14:04:65:EA:91:A1:B3
            X509v3 Issuing Distribution Point: critical
                Full Name:
                  URI:https://www.efirma.com.py/repositorio/efirma2.crl

Revoked Certificates:
    Serial Number: 3CD7DB14CF35364E64726D4AA5C64282
        Revocation Date: Jun 19 19:25:45 2023 GMT
        CRL entry extensions:
            X509v3 CRL Reason Code: 
                Unspecified
```

La información contenida puede sintetizarse así:

1. **Emisor del CRL**: VIT S.A., identificada por su RUC, en su rol de autoridad certificadora.
2. **Periodicidad de actualización**: La lista fue actualizada el 27 de septiembre de 2025, con próxima actualización prevista para el día siguiente. Una ventana de doce horas representa un período concreto de exposición a información desactualizada.
3. **Identificadores de integridad**: El número de CRL y la clave de la autoridad permiten verificar que la lista no fue modificada desde su emisión.
4. **Certificados revocados**: Número de serie, fecha de revocación y, cuando se documenta, razón. En el ejemplo, la razón figura como *Unspecified*, lo que dificulta cualquier auditoría posterior sobre las circunstancias de la revocación.

> [!NOTE]
> Si un certificado ha expirado y no aparece en el CRL, ¿la firma es válida?
> No necesariamente. La validación de una firma digital requiere dos condiciones independientes: (1) el certificado debe estar dentro de su período de validez en el momento de la firma, y (2) el certificado no debe haber sido revocado. Para que la fecha de la firma sea verificable con certeza en el tiempo, las firmas deben incorporar un sello de tiempo (*timestamp*) criptográfico —v. {{< link your-e-signature-is-broken >}}.

## Lo que debería existir.

La brecha entre el estado actual y el estándar exigible no responde a limitaciones técnicas. Las herramientas y protocolos necesarios están normalizados desde hace décadas. Es, en esencia, una cuestión de voluntad regulatoria y de exigencia efectiva de cumplimiento.

Un servicio de consulta genuinamente accesible al público debería contemplar, como mínimo:

- **Un portal web** donde cualquier persona pueda ingresar el número de serie de un certificado y obtener su estado: vigente, expirado o revocado, con fecha y razón de revocación cuando corresponda.
- **Un servicio OCSP público**, consultable por software de verificación, conforme al RFC 6960.
- **Historial de revocaciones accesible**, no solo el estado vigente. Un certificado revocado hace dos años sigue siendo relevante para auditar documentos firmados en ese período.
- **Razones de revocación documentadas**. La distinción entre una revocación por expiración programada y una por compromiso de seguridad tiene implicancias legales completamente distintas.

El marco normativo técnico existe: el RFC 5280 regula el estándar CRL [^5]; el RFC 6960 define OCSP; el perfil X.509 establece la estructura de los certificados. Lo que falta es que el organismo regulador exija la implementación efectiva de estos estándares y que los PSCs rindan cuentas por el cumplimiento real —no meramente formal— de la obligación legal de accesibilidad.

---

[^1]: Reglamento (UE) N.º 910/2014 del Parlamento Europeo y del Consejo, de 23 de julio de 2014, relativo a la identificación electrónica y los servicios de confianza para las transacciones electrónicas en el mercado interior (eIDAS).
[^2]: Cooper, D. et al. (2008). *Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile*. RFC 5280. IETF.
[^3]: ITU-T Recommendation X.509 (2019). *Information technology – Open Systems Interconnection – The Directory: Public-key and attribute certificate frameworks*. ITU.
[^4]: Santesson, S. et al. (2013). *X.509 Internet Public Key Infrastructure Online Certificate Status Protocol – OCSP*. RFC 6960. IETF.
[^5]: Cooper, D. et al. (2008). RFC 5280, op. cit.
