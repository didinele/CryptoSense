# Raport: Utilizarea Tool-urilor AI in Dezvoltarea CryptoSense

## 1. Instrumentele AI Utilizate si Evolutia Acestora

Procesul de dezvoltare a implicat o tranzitie interesanta intre doua instrumente principale, condusa de factori economici.

**Faza initiala - GitHub Copilot (plan student):** Dezvoltarea a inceput cu GitHub Copilot, utilizand modelele disponibile in interfata: **Gemini 3.1 Pro** si **Claude Sonnet 4.6**. Ambele modele au fost folosite in rotatie, Gemini pentru generare de boilerplate voluminos, Claude Sonnet pentru sarcini cu cerinte de logica mai stricta (ingineria prompturilor pentru agenti).

**Tranzitia catre Claude Pro:** In cursul dezvoltarii, GitHub a modificat structura planurilor Copilot: planul student a devenit semnificativ mai putin avantajos, iar planul Pro a ajuns sa fie mai scump decat un abonament direct **Claude Pro**. Decizia de a migra a fost rapida - accesul direct la Claude (inclusiv prin Claude Code CLI) oferea mai mult pentru acelasi pret sau mai putin, fara constrangerile suplimentare ale platformei Copilot.

---

## 2. Planificare si Arhitectura

**Instrumente:** GitHub Copilot (Claude Sonnet 4.6)

Cel mai complex aspect arhitectural al proiectului a fost decizia de a construi un **monorepo TypeScript** cu Yarn 4 Workspaces si Turborepo. Aceasta alegere implica un setup non-trivial: configurarea grafica a dependentelor intre pachete (`packages/core`, `packages/db`, `services/api`, `apps/dashboard`), mostenirea configuratiilor TypeScript si ESLint, si orchestrarea pipeline-urilor de build prin `turbo.json`.

AI-ul a functionat ca **sounding board** pentru aceasta decizie arhitecturala, ajutand la evaluarea trade-off-urilor (e.g. Polka vs. Express/Fastify pentru microserviciul de backend) si la generarea scheletului initial al configuratiei Turborepo. De asemenea, arhitectura pipeline-ului de agenti (Analist + Sentiment in paralel, Strategist la final pe baza output-ului ambilor) a fost rafinata cu ajutorul AI, pornind de la descrierea cerintelor in limbaj natural.

---

## 3. Scaffolding Monorepo si Generare de Cod

**Instrumente:** GitHub Copilot, Claude Pro / Claude Code

O proportie semnificativa din codul de infrastructura a fost generat cu asistenta AI:

- Configuratia `turbo.json` cu dependentele corecte intre task-uri (`build`, `lint`, `test`).
- Configuratia `tsconfig.base.json` si fisierele derivate per pachet.
- Schema bazei de date PostgreSQL (`packages/db`) si clientul de baza de date.
- Structura routerelor API in Polka (`services/api/src/routes`), inclusiv autentificarea JWT si cron job-urile de sincronizare (preturi Binance, feed-uri RSS CoinDesk/CoinTelegraph/Decrypt).
- Componentele frontend in Next.js 15 cu App Router si Tailwind CSS v4.

In toate aceste cazuri, AI-ul a eliminat "overhead-ul de boilerplate", permitand echipei sa se concentreze pe logica specifica proiectului.

---

## 4. Ingineria Prompturilor pentru Cei Trei Agenti

**Instrumente:** Claude Pro / Claude Code

Nucleul aplicatiei este reprezentat de cei trei agenti AI care ruleaza pe un LLM local (Ollama / Llama 3). Ingineria prompturilor a reprezentat cea mai iterativa si mai critica parte a developmentului, in care asistenta AI a jucat un rol esential.

**Agentul Analist:** Promptul trebuie sa forteze LLM-ul sa returneze un JSON strict (fara text in jurul lui), sa calculeze corect procentul de volatilitate (`(ultimul - primul) / primul * 100`) si sa nu halucineze valori monetare. O problema recurenta a fost ca modelele LLM fac greseli aritmetice -- solutia gasita a fost sa includa explicit formula matematica in prompt si sa impuna formatul numeric brut (fara simbolul `%`). Structura output-ului este validata la runtime prin schema **Zod** (`AnalystOutputSchema`).

**Agentul de Sentiment:** Primeste titluri de stiri reale (sincronizate din RSS la fiecare 15 minute) si trebuie sa clasifice fiecare titular ca `positive`, `negative` sau `neutral`, returnand si un `aggregateScore` intre 0 si 100. Promptul a fost rafinat iterativ pentru a evita raspunsurile vagi sau clasificarile inconsistente pe stiri evident negative (ex: hack-uri de exchange).

**Agentul Strategist:** Primeste output-ul structurat de la ceilalti doi agenti si formuleaza o recomandare (`BUY` / `SELL` / `HOLD`) cu nivel de incredere si explicatie in limbaj natural. Constrangerea principala impusa in prompt este sa nu inventeze date de pret sau de sentiment care nu au fost furnizate explicit in context.

---

## 5. AI Evals si Testare Automata

**Instrumente:** Claude Pro / Claude Code

Proiectul contine trei fisiere de evaluare automata a agentilor (`analyst.eval.test.ts`, `sentiment.eval.test.ts`, `strategist.eval.test.ts`), generate si rafinate cu asistenta AI. Acestea nu sunt teste unitare clasice -- sunt **evals**, adica teste care apeleaza efectiv agentul (inclusiv LLM-ul local, daca e disponibil) si verifica:

- **Conformitatea schemei:** Output-ul este validat prin `AnalystOutputSchema.parse()` / `SentimentOutputSchema.safeParse()` -- daca LLM-ul returneaza text malformat, testul pica.
- **Logica comportamentala:** De exemplu, testul de volatilitate furnizeaza un array de preturi cu o scadere de 15% si verifica explicit ca `volatilityAlert === true` si `volatilityPercentage >= 5`, indiferent daca raspunsul vine de la LLM sau de la fallback-ul algoritmic.
- **Clasificarea sentimentului:** Un test furnizeaza titluri intentionat mixte (un articol despre un record de pret, un articol despre un hack de exchange) si verifica ca agentul clasifica corect polaritatea fiecaruia.

Timeout-ul testelor este setat la 60 de secunde pentru a acomoda latenta generarii locale.

---

## 6. CI/CD si Infrastructura

**Instrumente:** GitHub Copilot, Claude Pro

Fisierul `.github/workflows/ci.yml` a fost generat cu asistenta AI si configureaza un pipeline GitHub Actions care ruleaza la fiecare push sau pull request pe `main`: instalare dependente (`yarn install --immutable`), linting (`yarn lint`), testare (`yarn test`) si build (`yarn build`). De asemenea, `Dockerfile` si `docker-compose.yml` pentru containerizarea aplicatiei au fost generate cu asistenta AI.

De remarcat: deoarece agentii AI au fallback algoritmic, suita de evals ruleaza corect si in CI, fara a necesita Ollama instalat pe runner-ul GitHub.

---

## 7. Concluzii

Integrarea instrumentelor AI in developmentul CryptoSense a acoperit intregul ciclu de viata al proiectului. Impactul cel mai semnificativ a fost in doua zone: eliminarea overhead-ului de scaffolding (configuratii TypeScript, Turborepo, Docker) si rafinarea iterativa a prompturilor pentru cei trei agenti, care reprezinta nucleul functional al aplicatiei.
