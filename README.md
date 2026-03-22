# CryptoSense: Multi-Agent Trading Insights

**Curs:** Metodologii de Dezvoltare Software (MDS) 2026  
**Echipa:** Cristea Denis-Adrian, Liviu Marinică
**Link Demo**: ...

---

## 📖 Descrierea Aplicației
**CryptoSense** este o platformă inteligentă de analiză a pieței crypto, creată pentru a oferi utilizatorilor decizii de tranzacționare informate, eliminând "zgomotul" informațional. 

Sistemul se bazează pe o arhitectură de **micro-agenți autonomi** care colaborează pentru a analiza atât date cantitative (prețuri), cât și calitative (știri). Spre deosebire de aplicațiile web clasice, logica principală este condusă de inteligența artificială (modele de limbaj de dimensiuni mici care pot rula local).

### 🤖 Arhitectura Agenților
Sistemul nostru integrează 3 agenți specifici care reprezintă nucleul funcționalității:
1. **Agentul Analist (Analyst Agent):** Citește istoricul prețurilor (date OHLCV) din baza de date și identifică trenduri tehnice, suport, rezistență și anomalii (ex: scăderi bruște de volum).
2. **Agentul de Sentiment (News/Sentiment Agent):** Scanează automat titlurile de știri pentru ticker-ele urmărite și decide polaritatea pieței (Bullish/Bearish).
3. **Agentul Strateg (Investment Strategist):** Primește concluziile de la Analist și Sentiment, coroborează datele și formulează o recomandare acționabilă în limbaj natural (ex: *"Deși prețul Bitcoin scade, sentimentul știrilor este puternic pozitiv; recomandăm HOLD"*).

---

## 📋 Product Backlog & User Stories

### Epic 1: Infrastructură și Cont Utilizator
* **US 1.0: Autentificare securizată**
  * **Descriere:** Ca utilizator, vreau să îmi creez un cont cu email și parolă pentru a-mi salva portofoliul urmărit.
  * **Criterii de acceptare:** Parolele sunt criptate (hash) în baza de date; sesiunea este menținută prin JWT.
* **US 1.1: Sincronizare date de piață**
  * **Descriere:** Ca sistem, trebuie să preiau date de preț în timp real (via API public, ex: Binance/CoinGecko) pentru a alimenta Agentul Analist.
  * **Criterii de acceptare:** Datele sunt aduse și salvate în DB la un interval regulat (cron job).

### Epic 2: Analiză Tehnică (Agentul Analist)
* **US 2.0: Detectare automată a trendurilor**
  * **Descriere:** Ca trader, vreau ca Agentul Analist să identifice nivelurile de suport/rezistență, pentru a ști dacă activul este supra-vândut.
  * **Criterii de acceptare:** Agentul procesează array-ul de prețuri și returnează nivelurile cheie în UI.
* **US 2.1: Alerte de volatilitate**
  * **Descriere:** Ca utilizator, vreau să primesc o alertă pe dashboard dacă Agentul Analist detectează o mișcare de preț mai mare de 5% în ultima oră.
  * **Criterii de acceptare:** UI-ul afișează o notificare de tip "Warning" generată de agent.

### Epic 3: Analiza Sentimentului (Agentul de Sentiment)
* **US 3.0: Clasificarea știrilor recente**
  * **Descriere:** Ca utilizator, vreau ca Agentul de Sentiment să scaneze ultimele 10 știri despre o monedă și să le clasifice ca pozitive, negative sau neutre.
  * **Criterii de acceptare:** Prompt-ul către agent forțează un output JSON strict cu polaritatea fiecărei știri.
* **US 3.1: Scorul de Sentiment Agregat**
  * **Descriere:** Ca trader, vreau să văd un "Scor de Sentiment" (0-100) pentru a înțelege rapid panica sau euforia generală.
  * **Criterii de acceptare:** Afișarea grafică a scorului sub formă de progres/gauge pe pagina principală.

### Epic 4: Recomandări Strategice & Dashboard (Agentul Strateg)
* **US 4.0: Generarea recomandării finale**
  * **Descriere:** Ca utilizator, vreau ca Agentul Strateg să îmi ofere o concluzie clară (Buy/Sell/Hold) bazată pe datele celorlalți doi agenți.
  * **Criterii de acceptare:** Agentul primește contextul complet și returnează un paragraf explicativ scurt, fără a inventa date (fără halucinații pe preț).
* **US 4.1: Dashboard centralizat**
  * **Descriere:** Ca utilizator, vreau un panou principal unde să vizualizez prețul curent, scorul de sentiment și recomandarea AI simultan.
  * **Criterii de acceptare:** Interfață responsivă cu 3 secțiuni distincte, populate asincron.

### Epic 5: Evals & Calitatea Sistemului AI
* **US 5.0: Evaluarea automată a halucinațiilor (Evals)**
  * **Descriere:** Ca dezvoltator, vreau un sistem automatizat care testează (evals) dacă Agentul Strateg recomandă corect pe baza unui set de date de test (mock data).
  * **Criterii de acceptare:** Există un script de test care rulează agentul pe date vechi și validează coerența răspunsului.
* **US 5.1: Feedback utilizator (Human-in-the-loop)**
  * **Descriere:** Ca utilizator, vreau să pot evalua recomandarea Agentului Strateg (Thumbs Up/Down) pentru a marca dacă a fost utilă.
  * **Criterii de acceptare:** Butoanele de feedback salvează răspunsul în baza de date pentru raportarea calității AI-ului.
