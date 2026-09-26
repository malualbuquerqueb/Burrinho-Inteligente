# Burrinho Inteligente

Jogo de dominó "Burrinho Inteligente" feito em HTML, CSS e JavaScript puro, como atividade da faculdade.

## Como executar

Baixe os arquivos e abra o `index.html` no navegador. Não precisa instalar nada.

## Arquivos

```text
index.html   -> página do jogo
estilo.css    -> estilo básico da página
script.js    -> classes do jogo e lógica da página
```

## Como jogar

- **Modo Jogador:** a cada jogada, digite `1` para tentar encaixar pelo início ou `2` para tentar pelo fim. A peça só é sorteada depois da escolha, então o jogador não vê a peça antes de decidir.
- **Modo Simulação:** as jogadas acontecem sozinhas, a cada 700 ms, com o lado (início ou fim) sorteado aleatoriamente.

A tela mostra o placar, a peça retirada, a vez do jogador, as peças restantes e a última jogada.

## Estrutura do código

| Classe | Função |
|---|---|
| `CabecaPeca` | Cabeças possíveis: BRANCO, PIO, DUQUE, TERNO, QUADRA, QUINA, SENA |
| `Peca` | Uma peça com cabeça `esquerda` e `direita` |
| `CasaTabuleiro` | Uma casa (nó) com `peca`, `anterior` e `proximo` |
| `Tabuleiro` | Lista duplamente encadeada com `inicio`, `fim` e `tamanho` |
| `BurrinhoInteligente` | Controla o conjunto de peças, os jogadores, o placar e as jogadas |

### Regras de `incluirDoInicio` e `incluirDoFim`

| Situação | Onde a peça entra | Retorno |
|---|---|---|
| Tabuleiro vazio | Primeira casa | `0` |
| Uma casa (`incluirDoInicio`) | Depois da casa existente | `1` |
| Uma casa (`incluirDoFim`) | Antes da casa existente | `1` |
| Encaixa na esquerda da primeira casa | Antes da primeira | `2` |
| Encaixa na direita da última casa | Depois da última | `1` |
| Encaixa entre duas casas | Entre as duas | `tamanho - casas andadas - 1` |
| Não encaixa | Não entra | `-1` |

Com mais de uma casa, `incluirDoInicio` procura a partir do início (primeira casa, depois as intermediárias, depois a última). Já `incluirDoFim` procura a partir do fim (última casa, depois as intermediárias de trás para frente, depois a primeira).

### Regras do jogo

- O conjunto começa com as 28 peças do dominó.
- As peças são retiradas aleatoriamente.
- Peças encaixadas saem do conjunto, e peças que não encaixam voltam para ele.
- Os jogadores se alternam a cada jogada.
- O jogo termina quando o conjunto fica vazio.

## Decisões de implementação

Alguns pontos não são definidos no enunciado. As escolhas adotadas foram estas:

- **Placar:** cada encaixe soma ao jogador o valor retornado pelo método de inclusão.
- **Retorno quando não encaixa:** `-1`.
- **Casas andadas:** a contagem começa em `0` no primeiro par verificado, e o tamanho usado é o de antes da inclusão.
- **Peças não são giradas**, pois o enunciado não prevê isso. Por consequência, o jogo quase sempre chega a um ponto em que nenhuma peça restante encaixa. Nesse caso o jogo também é encerrado, para não ficar em loop infinito.

## Assincronismo

O modo simulação usa `setInterval` para executar uma jogada a cada intervalo, e `clearInterval` para parar quando o jogo termina ou quando um novo jogo é iniciado.
