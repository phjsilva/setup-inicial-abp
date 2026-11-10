import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';

export function useClickOutside<TBotao extends HTMLElement, TConteudo extends HTMLElement>(
    aberto: boolean,
    botaoRef: RefObject<TBotao | null>,
    conteudoRef: RefObject<TConteudo | null>,
    setAberto: Dispatch<SetStateAction<boolean>>,
) {
    useEffect(() => {
        if (!aberto) return;

        function verificarClique(event: PointerEvent) {
            const alvo = event.target;

            if (!(alvo instanceof Node)) return;

            const clicouNoBotao = botaoRef.current?.contains(alvo) ?? false;

            const clicouNoConteudo = conteudoRef.current?.contains(alvo) ?? false;

            if (!clicouNoBotao && !clicouNoConteudo) {
                setAberto(false);
            }
        }

        document.addEventListener('pointerdown', verificarClique);

        return () => {
            document.removeEventListener('pointerdown', verificarClique);
        };
    }, [aberto, botaoRef, conteudoRef, setAberto]);
}
