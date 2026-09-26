const CabecaPeca = Object.freeze({
    BRANCO: 0,
    PIO: 1,
    DUQUE: 2,
    TERNO: 3,
    QUADRA: 4,
    QUINA: 5,
    SENA: 6
});

const NOMES_CABECA = ["BRANCO", "PIO", "DUQUE", "TERNO", "QUADRA", "QUINA", "SENA"];
const NAO_ENCAIXOU = -1;

class Peca {
    constructor(esquerda, direita) {
        this.esquerda = esquerda;
        this.direita = direita;
    }

    temCabeca(cabeca) {
        return this.esquerda === cabeca || this.direita === cabeca;
    }

    toString() {
        return "[ " + NOMES_CABECA[this.esquerda] + " | " + NOMES_CABECA[this.direita] + " ]";
    }
}

class CasaTabuleiro {
    constructor(peca) {
        this.peca = peca;
        this.proximo = null;
        this.anterior = null;
    }
}

class Tabuleiro {
    constructor() {
        this.inicio = null;
        this.fim = null;
        this.tamanho = 0;
    }

    inserirAntesDoInicio(nova) {
        nova.proximo = this.inicio;
        this.inicio.anterior = nova;
        this.inicio = nova;
        this.tamanho++;
    }

    inserirDepoisDoFim(nova) {
        nova.anterior = this.fim;
        this.fim.proximo = nova;
        this.fim = nova;
        this.tamanho++;
    }

    inserirEntre(casaA, casaB, nova) {
        nova.anterior = casaA;
        nova.proximo = casaB;
        casaA.proximo = nova;
        casaB.anterior = nova;
        this.tamanho++;
    }

    inserirPrimeiraCasa(nova) {
        this.inicio = nova;
        this.fim = nova;
        this.tamanho = 1;
    }

    encaixaEntre(casaA, casaB, peca) {
        const a = casaA.peca.direita;
        const b = casaB.peca.esquerda;
        return (a === peca.esquerda && b === peca.direita) ||
               (a === peca.direita && b === peca.esquerda);
    }

    encaixaNaUnicaCasa(peca) {
        const existente = this.inicio.peca;
        return existente.temCabeca(peca.esquerda) || existente.temCabeca(peca.direita);
    }

    incluirDoInicio(peca) {
        const nova = new CasaTabuleiro(peca);

        if (this.tamanho === 0) {
            this.inserirPrimeiraCasa(nova);
            return 0;
        }

        if (this.tamanho === 1) {
            if (this.encaixaNaUnicaCasa(peca)) {
                this.inserirDepoisDoFim(nova);
                return 1;
            }
            return NAO_ENCAIXOU;
        }

        if (peca.temCabeca(this.inicio.peca.esquerda)) {
            this.inserirAntesDoInicio(nova);
            return 2;
        }

        let atual = this.inicio;
        let andadas = 0;
        while (atual.proximo !== null) {
            if (this.encaixaEntre(atual, atual.proximo, peca)) {
                const retorno = this.tamanho - andadas - 1;
                this.inserirEntre(atual, atual.proximo, nova);
                return retorno;
            }
            atual = atual.proximo;
            andadas++;
        }

        if (peca.temCabeca(this.fim.peca.direita)) {
            this.inserirDepoisDoFim(nova);
            return 1;
        }

        return NAO_ENCAIXOU;
    }

    incluirDoFim(peca) {
        const nova = new CasaTabuleiro(peca);

        if (this.tamanho === 0) {
            this.inserirPrimeiraCasa(nova);
            return 0;
        }

        if (this.tamanho === 1) {
            if (this.encaixaNaUnicaCasa(peca)) {
                this.inserirAntesDoInicio(nova);
                return 1;
            }
            return NAO_ENCAIXOU;
        }

        if (peca.temCabeca(this.fim.peca.direita)) {
            this.inserirDepoisDoFim(nova);
            return 1;
        }

        let atual = this.fim;
        let andadas = 0;
        while (atual.anterior !== null) {
            if (this.encaixaEntre(atual.anterior, atual, peca)) {
                const retorno = this.tamanho - andadas - 1;
                this.inserirEntre(atual.anterior, atual, nova);
                return retorno;
            }
            atual = atual.anterior;
            andadas++;
        }

        if (peca.temCabeca(this.inicio.peca.esquerda)) {
            this.inserirAntesDoInicio(nova);
            return 2;
        }

        return NAO_ENCAIXOU;
    }

    podeEncaixar(peca) {
        if (this.tamanho === 0) return true;
        if (this.tamanho === 1) return this.encaixaNaUnicaCasa(peca);
        if (peca.temCabeca(this.inicio.peca.esquerda)) return true;
        if (peca.temCabeca(this.fim.peca.direita)) return true;
        let atual = this.inicio;
        while (atual.proximo !== null) {
            if (this.encaixaEntre(atual, atual.proximo, peca)) return true;
            atual = atual.proximo;
        }
        return false;
    }

    toString() {
        const partes = [];
        let atual = this.inicio;
        while (atual !== null) {
            partes.push(atual.peca.toString());
            atual = atual.proximo;
        }
        return partes.length ? partes.join(" ") : "(vazio)";
    }
}

class BurrinhoInteligente {
    constructor(modoSimulacao) {
        this.modoSimulacao = modoSimulacao;
        this.tabuleiro = new Tabuleiro();
        this.conjunto = this.criarDomino();
        this.placar = [0, 0];
        this.jogadorAtual = 0;
        this.ultimaJogada = "-";
        this.pecaRetirada = null;
        this.terminou = false;
    }

    criarDomino() {
        const pecas = [];
        for (let i = CabecaPeca.BRANCO; i <= CabecaPeca.SENA; i++) {
            for (let j = i; j <= CabecaPeca.SENA; j++) {
                pecas.push(new Peca(i, j));
            }
        }
        return pecas;
    }

    retirarPeca() {
        const indice = Math.floor(Math.random() * this.conjunto.length);
        return this.conjunto.splice(indice, 1)[0];
    }

    jogar(opcao) {
        if (this.terminou) return;

        if (this.modoSimulacao) {
            opcao = Math.random() < 0.5 ? 1 : 2;
        }

        const peca = this.retirarPeca();
        this.pecaRetirada = peca;

        const retorno = opcao === 1
            ? this.tabuleiro.incluirDoInicio(peca)
            : this.tabuleiro.incluirDoFim(peca);

        const nomeJogador = "Jogador " + (this.jogadorAtual + 1);
        const lado = opcao === 1 ? "início" : "fim";

        if (retorno === NAO_ENCAIXOU) {
            this.conjunto.push(peca);
            this.ultimaJogada = nomeJogador + " tentou pelo " + lado + " com " + peca +
                " e não encaixou (peça voltou ao conjunto)";
        } else {
            this.placar[this.jogadorAtual] += retorno;
            this.ultimaJogada = nomeJogador + " encaixou " + peca + " pelo " + lado +
                " (retorno " + retorno + ")";
        }

        if (this.conjunto.length === 0) {
            this.terminou = true;
        } else if (!this.conjunto.some(p => this.tabuleiro.podeEncaixar(p))) {
            this.terminou = true;
            this.ultimaJogada += ". Nenhuma peça restante encaixa: jogo travado";
        }

        this.jogadorAtual = this.jogadorAtual === 0 ? 1 : 0;
    }

    vencedor() {
        if (this.placar[0] > this.placar[1]) return "Jogador 1 venceu!";
        if (this.placar[1] > this.placar[0]) return "Jogador 2 venceu!";
        return "Empate!";
    }
}

let jogo = null;
let intervalo = null;
const TEMPO_SIMULACAO = 700;

function iniciar(modoSimulacao) {
    clearInterval(intervalo);
    jogo = new BurrinhoInteligente(modoSimulacao);

    const entrada = document.getElementById("opcao");
    const botaoJogar = document.getElementById("jogar");
    entrada.value = "";
    entrada.disabled = modoSimulacao;
    botaoJogar.disabled = modoSimulacao;
    document.getElementById("areaJogador").style.display = modoSimulacao ? "none" : "block";
    document.getElementById("modo").textContent = modoSimulacao ? "Simulação" : "Jogador";

    atualizarTela();

    if (modoSimulacao) {
        intervalo = setInterval(function () {
            jogo.jogar();
            atualizarTela();
            if (jogo.terminou) clearInterval(intervalo);
        }, TEMPO_SIMULACAO);
    } else {
        entrada.focus();
    }
}

function jogarManual() {
    if (!jogo || jogo.modoSimulacao || jogo.terminou) return;

    const entrada = document.getElementById("opcao");
    const opcao = Number(entrada.value.trim());
    if (opcao !== 1 && opcao !== 2) {
        document.getElementById("mensagem").textContent = "Opção inválida. Digite 1 ou 2.";
        return;
    }

    jogo.jogar(opcao);
    entrada.value = "";
    entrada.focus();
    atualizarTela();
}

function atualizarTela() {
    document.getElementById("placar1").textContent = jogo.placar[0];
    document.getElementById("placar2").textContent = jogo.placar[1];
    document.getElementById("peca").textContent = jogo.pecaRetirada ? jogo.pecaRetirada.toString() : "-";
    document.getElementById("vez").textContent = jogo.terminou ? "-" : "Jogador " + (jogo.jogadorAtual + 1);
    document.getElementById("restantes").textContent = jogo.conjunto.length;
    document.getElementById("ultima").textContent = jogo.ultimaJogada;
    document.getElementById("tabuleiro").textContent = jogo.tabuleiro.toString();
    document.getElementById("mensagem").textContent = jogo.terminou ? "Fim de jogo! " + jogo.vencedor() : "";

    if (jogo.terminou) {
        document.getElementById("opcao").disabled = true;
        document.getElementById("jogar").disabled = true;
    }
}

if (typeof module !== "undefined") {
    module.exports = { CabecaPeca, Peca, CasaTabuleiro, Tabuleiro, BurrinhoInteligente, NAO_ENCAIXOU };
}
