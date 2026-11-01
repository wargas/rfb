import { config } from "@/lib/config";
import { Receita } from "@/types";
import { filter, sumBy } from "lodash";
import { useCallback, useMemo, useState } from "react";

export function calcularPss(base: number) {
    let limiteAnterior = 0

    return sumBy(config.faixas_pss, ({ ate, aliquota }) => {
        const parcela = Math.max(Math.min(base, ate) - limiteAnterior, 0)
        limiteAnterior = ate
        return parcela * aliquota
    })
}

export function useHook() {
    const [outrasReceitas, setOutrasReceitas] = useState<Receita[]>([])

    const [params, setParams] = useState({
        faixa_bep: '100',
        insalubridade: 'nao',
        diasFronteira: 0,
        dependentesIR: 0,
        nivel: 'SEGUNDA-I',
        complementar: 8.5,
        sindicato: 0,
        teto: true,
        ajuste: 0,
        consignado: 0,
        diasTrabalhados: 30,
        regime_tributario: '1',
    })

    const receitas = useMemo(() => {


        const nivel = params.nivel as keyof typeof config.tabela

        const vencimento = config.tabela[nivel]

        const faixa_bep = params.faixa_bep as keyof typeof config.faixas_bep

        const quocienteDiasTrabalhados = params.diasTrabalhados / 30;

        return [
            {
                id: 'vencimento',
                name: 'vencimento básico',
                ir: true,
                previdencia: true,
                teto: true,
                value: vencimento * quocienteDiasTrabalhados
            },
            {
                id: 'bep',
                name: 'BEP - Bônus de Eficiência e Produtividade',
                ir: true,
                previdencia: false,
                teto: true,
                value: (config.bepIntegral * config.faixas_bep[faixa_bep].percentual) * quocienteDiasTrabalhados
            },
            {
                id: 'insalubridade',
                name: 'adicional de insalubridade',
                ir: true,
                previdencia: false,
                teto: true,
                value: params.insalubridade == 'sim' ? (vencimento * config.percentualInsalubridade) * quocienteDiasTrabalhados : 0
            },
            {
                id: 'fronteira',
                name: 'adicional de fronteira',
                ir: false,
                previdencia: false,
                teto: false,
                value: config.valorDiaFronteira * params.diasFronteira
            },
            {
                id: 'auxilio_alimentacao',
                name: 'auxílio-alimentação',
                ir: false,
                previdencia: false,
                teto: false,
                value: config.auxilioAlimentacao * quocienteDiasTrabalhados
            },
            ...outrasReceitas
        ]
    }, [params, config, outrasReceitas])

    const bcPrevidencia = useMemo(() => {
        let geral_teto = sumBy(filter(receitas, { previdencia: true, teto: true }), 'value')
        let geral_no_teto = sumBy(filter(receitas, { previdencia: true, teto: false }), 'value')
        let geral_teto_no_prev = sumBy(filter(receitas, { previdencia: false, teto: true }), 'value')

        if (geral_teto > config.tetoRemuneratorio && params.teto) {
            geral_teto = config.tetoRemuneratorio -  geral_teto_no_prev
        }

        const geral = geral_teto + geral_no_teto;

        const bcPss = Math.min(geral, config.tetoINSS);
        const bcComplementar = geral - bcPss

        return {
            pss: bcPss,
            complementar: bcComplementar
        }

    }, [receitas])

    const bcIR = useMemo(() => {
        const descontoDependente = params.dependentesIR * 189.59

        let ir_teto = sumBy(filter(receitas, { ir: true, teto: true }), 'value')
        const ir_no_teto = sumBy(filter(receitas, { ir: true, teto: false }), 'value')
        const no_ir_teto = sumBy(filter(receitas, { ir: false, teto: true }), 'value')

        if (ir_teto > config.tetoRemuneratorio && params.teto) {
            ir_teto = config.tetoRemuneratorio - no_ir_teto
        }

        return ir_teto + ir_no_teto - descontoDependente
    }, [receitas, params])

    const descontos = useMemo(() => {

        let valorPss = calcularPss(bcPrevidencia.pss)
        let valorPrevComplementar = bcPrevidencia.complementar * (params.complementar / 100)

        if (params.regime_tributario == '2') {
            valorPss = calcularPss(bcPrevidencia.pss + bcPrevidencia.complementar)
            valorPrevComplementar = 0;
        }

        const bcIR2 = bcIR - valorPss - valorPrevComplementar;

        const valorIR = bcIR2 * 0.275 - 908.73

        const receitasTeto = sumBy(filter(receitas, { teto: true }), 'value')

        const descontoTeto = (config.tetoRemuneratorio < receitasTeto && params.teto) ? receitasTeto - config.tetoRemuneratorio : 0

        return [
            { name: 'pss', value: valorPss },
            { name: 'Funpresp', value: valorPrevComplementar },
            { name: 'sindicato', value: params.sindicato },
            { name: 'irpf', value: valorIR },
            { name: 'desconto teto', value: descontoTeto },
            { name: 'consignados', value: params.consignado }
        ]
    }, [receitas, params])

    const changeValue = useCallback((data: Partial<typeof params>) => {
        setParams(p => ({ ...p, ...data }))
    }, [params])


    const removeOutrasReceitasById = useCallback((id: string) => {
        setOutrasReceitas(old => old.filter(o => o.id != id))
    }, [outrasReceitas])

    return { changeValue, removeOutrasReceitasById, descontos, bcIR, bcPrevidencia, receitas, params, setParams, outrasReceitas, setOutrasReceitas }
}
