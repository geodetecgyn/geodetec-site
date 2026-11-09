# GeoDetec – site institucional

Site estático (HTML, CSS e JavaScript puro) hospedado no **GitHub Pages**. Não tem framework nem etapa de build.

> **Autoria e propriedade:** Eduardo Silva Pinzetta, Engenheiro Ambiental e Sanitarista e Desenvolvedor Master (full-stack).
> © 2026 GeoDetec / Eduardo Silva Pinzetta. Todos os direitos reservados (veja `LICENSE`).

---

## Estrutura

```
index.html                 página principal (âncoras: serviços, ITR, fauna, projetos, como trabalhamos, equipe, parcerias, FAQ, contato)
servicos/_template.html    modelo das páginas de serviço
servicos/<slug>.html       páginas geradas (não edite à mão; edite o JSON e gere de novo)
privacidade.html           política de privacidade (LGPD)
404.html                   página de erro
assets/css/style.css       estilo único, mobile-first
assets/js/main.js          menu, render dos JSON, filtros, lightbox, antes/depois, FAQ, WhatsApp
assets/img/marca/          logos (versões web)
assets/img/projetos/       mapas anonimizados (WebP + JPG em 480/960/1600 px)
assets/img/campo/          fotos de campo tratadas (sem GPS, sem data, sem carimbos, com marca "© GeoDetec")
data/servicos.json         serviços e grupos
data/projetos.json         portfólio
data/equipe.json           áreas e pessoas
data/faq.json              perguntas frequentes
data/contato.json          WhatsApp, e-mail, Instagram, CNPJ e região (um lugar só)
tools/gerar-paginas.mjs    gera as páginas de serviço, a lista <noscript> e o sitemap.xml
manifest.webmanifest  sitemap.xml  robots.txt  CNAME  humans.txt  LICENSE
```

## Testar no computador

O site carrega os JSON com `fetch`, então **não funciona abrindo o arquivo com dois cliques**. Use um servidor local:

```bash
python3 -m http.server 8080      # e abra http://localhost:8080
```

## Contato (tudo leva ao WhatsApp do Breno)

Edite só o `data/contato.json`:

```json
{
  "whatsapp": "5562999999999",
  "link_whatsapp": "",
  "email": "contato@seudominio.com.br",
  "instagram": "geodetec",
  "regiao": "Goiânia e todo o estado de Goiás",
  "cnpj": "00.000.000/0001-00"
}
```

- `whatsapp`: só números, com DDI 55 e DDD.
- `link_whatsapp`: se você tiver um link pronto (ex.: `https://wa.me/message/XXXX`), coloque aqui. Ele passa a valer no lugar do número. Links curtos do tipo `wa.me/message/...` não aceitam texto pré-preenchido.
- Depois de mudar o contato, rode `node tools/gerar-paginas.mjs`. Assim os links das páginas de serviço também funcionam para quem estiver sem JavaScript.

## Adicionar um projeto novo

1. Trate as imagens antes:
   - recorte para tirar carimbos de data e coordenada;
   - remova nomes, logos e qualquer coisa que identifique o cliente ou a fazenda;
   - exporte sem metadados.
2. Gere as versões **480, 960 e 1600 px** em `.webp` e `.jpg`, com o nome `arquivo-480.webp`, `arquivo-960.jpg` etc. (1600 só se a original tiver 1600 px ou mais). Coloque em `assets/img/projetos/`, ou em `assets/img/campo/` com `"pasta": "campo"`.
3. Acrescente um objeto em `data/projetos.json`, dentro de `"projetos"`:

```json
{
  "id": "georref-imovel-rural-norte-goiano",
  "categoria": "Georreferenciamento",
  "titulo": "Georreferenciamento e certificação SIGEF – imóvel rural em Goiás",
  "periodo": "Certificação no SIGEF",
  "servico": "georreferenciamento-sigef",
  "descricao": "Levantamento GNSS/RTK do perímetro, processamento e certificação no SIGEF, com planta e memorial para averbação.",
  "imagens": [
    {
      "pasta": "projetos",
      "arquivo": "georref_perimetro",
      "largura": 1800, "altura": 1350,
      "alt": "Perímetro do imóvel em amarelo sobre imagem de satélite, com entorno escurecido.",
      "legenda": "Perímetro certificado.",
      "legenda_mapa": [["#FFE95A", "Perímetro"]],
      "satelite": true
    }
  ]
}
```

- `categoria` precisa ser uma das listadas em `"categorias"`.
- `largura` e `altura` são as medidas da imagem original.
- `satelite: true` mostra automaticamente o crédito "Imagens: Google Earth Pro (Maxar/Airbus)".
- **Nunca** use nome de cliente, de fazenda ou de empresa, matrícula, número do CAR, coordenadas ou valores.

## Adicionar ou mudar um serviço

1. Edite `data/servicos.json`. Os campos são `slug`, `grupo`, `icone`, `titulo`, `resumo`, `o_que_e`, `quando_exigido`, `entregaveis`, `documentos` e `normas`, e opcionalmente `grupos_fauna`, `diferenciais` e `fotos`.
2. Rode `node tools/gerar-paginas.mjs` (precisa do Node 18 ou mais novo; não instala nada).
3. Os ícones disponíveis estão em `assets/img/icons.svg` (use o nome sem o `i-`).

## Equipe

`data/equipe.json` → `"pessoas"`. Enquanto a lista estiver vazia, o site mostra só as áreas. Exemplo:

```json
{ "nome": "Nome Sobrenome", "formacao": "Bióloga", "registro": "CRBio 00000/04-D", "funcao": "Fauna", "foto": "assets/img/equipe/nome.webp" }
```

## Publicar no GitHub Pages

1. Suba todos os arquivos para a branch `main` do repositório.
2. No GitHub, vá em **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch `main` / pasta `/ (root)`** e salve.
3. Em 1 a 2 minutos o site aparece em `https://<usuario>.github.io/<repositorio>/`.

### Domínio próprio

1. Troque `[[DOMINIO]]` pelo domínio, sem `https://` (ex.: `geodetec.com.br`). Faça isso em todos os arquivos: `CNAME`, `robots.txt`, metatags do `index.html`, `privacidade.html`, `servicos/_template.html` e a constante `DOMINIO` em `tools/gerar-paginas.mjs`. Depois rode `node tools/gerar-paginas.mjs`.
2. No provedor do domínio (Registro.br etc.), crie:
   - para o domínio raiz, 4 registros **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`;
   - para o `www`, um **CNAME** apontando para `<usuario>.github.io`.
3. Em **Settings → Pages → Custom domain**, informe o domínio e marque **Enforce HTTPS** quando liberar.

## Proteção

- **Content-Security-Policy** em todas as páginas. Ela libera só scripts do próprio site (mais o script inline do `<head>`, identificado por hash), fontes do Google Fonts e conexões ao próprio domínio.
  - Se você mudar o script inline `document.documentElement.classList.add('js')`, recalcule o hash: `printf "%s" "<script>" | openssl dgst -sha256 -binary | base64`.
- Todo conteúdo dos JSON é escapado antes de ir para a tela (sem `innerHTML` de dados crus).
- O formulário não envia dados para servidor nenhum: só monta a mensagem e abre o WhatsApp.
- As fotos de campo levam a marca "© GeoDetec" e vão sem metadados.
- Autoria registrada nos cabeçalhos de HTML, CSS e JS, em `<meta name="author">`, `humans.txt` e `LICENSE`.
- **Código privado:** no plano gratuito do GitHub, o Pages só publica a partir de repositório **público**. Se quiser o código fechado, use o GitHub Pro/Team (Pages a partir de repositório privado) ou outro host estático com repositório privado.

## Marcadores pendentes `[[...]]`

Eles aparecem destacados em amarelo no site até serem preenchidos.

| Marcador | Onde |
|---|---|
| `[[WHATSAPP_COM_DDI]]` | `data/contato.json` (e o JSON-LD do `index.html`) |
| `[[EMAIL]]` | `data/contato.json`, `privacidade.html`, JSON-LD |
| `[[INSTAGRAM]]` | `data/contato.json`, JSON-LD |
| `[[CIDADES/REGIÃO]]` | `data/contato.json` |
| `[[CNPJ]]` | `data/contato.json`, `privacidade.html`, JSON-LD |
| `[[CIDADE_SEDE]]` | JSON-LD do `index.html` |
| `[[DOMINIO]]` | `CNAME`, `robots.txt`, metatags, `tools/gerar-paginas.mjs` |
| `[[CONFIRMAR prazo vigente…]]` | georreferenciamento (serviço e FAQ): prazo do Decreto 12.689/2025 e projeto de lei de prorrogação |
| `[[CONFIRMAR regulamentação…]]` | DAI (serviço e FAQ): regulamentação e plataforma vigentes da Lei estadual 21.231/2022 |
| `[[CONFIRMAR vigência e vetos]]` | Licenciamento: Lei 15.190/2025 |
| `[[CONFIRMAR prazos atuais]]` | FAQ de licenciamento: prazos em Goiás (Lei 20.694/2019) |
| `[[CONFIRMAR]]` | Hidrossanitário: número/edição da ABNT NBR 17076:2024 |
| `[[CONFIRMAR prazo interno de guarda]]` | `privacidade.html` |
