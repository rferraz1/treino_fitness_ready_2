import os
import json

BASE = "public/gifs"   # Caminho onde estão as pastas de exercícios
OUTFILE = "public/gifs.json"

def main():
    if not os.path.isdir(BASE):
        print(f"❌ Pasta {BASE} não encontrada!")
        return

    resultado = {}

    # Percorre todas as subpastas dentro de public/gifs/
    for pasta in os.listdir(BASE):
        caminho = os.path.join(BASE, pasta)
        if os.path.isdir(caminho):

            # Lista só arquivos .gif
            gifs = [
                f for f in os.listdir(caminho)
                if f.lower().endswith(".gif")
            ]

            # Só adiciona a pasta se tiver GIFs
            if gifs:
                resultado[pasta] = gifs

    # Salva como JSON bonito
    with open(OUTFILE, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print("✅ gifs.json gerado com sucesso!")
    print(f"Arquivo salvo em: {OUTFILE}")
    print(f"Pastas encontradas: {len(resultado)}")


if __name__ == "__main__":
    main()
