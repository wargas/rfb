"use client"

import { FormProventos } from "@/components/form-provento";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { config } from "@/lib/config";
import { useHook } from "@/lib/hook";
import { cn, formatNumber } from "@/lib/utils";
import { sortBy, sumBy } from "lodash";
import { EyeIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showMenu, setShowMenu] = useState(true)
  const { changeValue, removeOutrasReceitasById, descontos, bcIR, bcPrevidencia, receitas, params, setParams, outrasReceitas, setOutrasReceitas } = useHook()

  return (
    <div className="flex flex-col mx-auto container p-4 gap-4">

      <div className="font-sans container mt-4 mx-auto">
        <Card>
          <CardHeader>
            <div className={cn({ "grid": showMenu, "hidden": !showMenu }, "transition-all grid-cols-2 lg:grid-cols-5 gap-4")}>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Classe e Padrão" htmlFor="">Classe / Padrão</Label>
                <Select value={params.nivel} onValueChange={(v: any) => changeValue({ nivel: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Classe / Padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <div>
                      {Object.keys(config.tabela).map(n => (
                        <SelectItem key={n} value={n}>
                          {n.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Tempo como servidor ativo no cargo, em meses" htmlFor="">BEP - Tempo no cargo (meses)</Label>
                <Select value={params.faixa_bep} onValueChange={(v: any) => changeValue({ faixa_bep: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tempo no cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(config.faixas_bep).map(([value, faixa]) => (
                      <SelectItem key={value} value={value}>
                        {faixa.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Adicional de Insalubridade" htmlFor="">Adicional de Insalubridade</Label>
                <Select value={params.insalubridade} onValueChange={(v: any) => changeValue({ insalubridade: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Adicional de Insalubridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao">Não recebe</SelectItem>
                    <SelectItem value="sim">Recebe (10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dias trabalhados em região de fronteira no mês" htmlFor="">
                  Dias de Fronteira
                  {params.diasFronteira > 0 && <span className="" onClick={() => changeValue({ diasFronteira: 0 })}>limpar</span>}
                </Label>
                <Input min={0} type="number" value={params.diasFronteira.toString()} onChange={ev => changeValue({ diasFronteira: parseInt(ev.target.value || '0') })} />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dependentes IR" htmlFor="">
                  Dependentes IR
                  {params.dependentesIR > 0 && <span className="" onClick={() => changeValue({ dependentesIR: 0 })}>limpar</span>}
                </Label>
                <Input min={0} type="number" value={params.dependentesIR.toString()} onChange={ev => changeValue({ dependentesIR: parseInt(ev.target.value || '0') })} />
              </div>
            </div>
            <div className="mt-2 flex gap-2 justify-end">

            <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Consignados</span>
                  {params.consignado > 0 && <span className="" onClick={() => changeValue({ consignado: 0 })}>limpar</span>}
                </Label>
                <Input
                  value={(params.consignado).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ consignado: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })}
                />
              </div>
              {/* <Button onClick={() => setShowMenu(!showMenu)}>
                <EyeIcon />
              </Button> */}
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Dias Trabalhados</span>
                  {params.diasTrabalhados > 0 && <span className="" onClick={() => changeValue({ diasTrabalhados: 30 })}>30 dias</span>}
                </Label>
                <Input
                  value={params.diasTrabalhados}
                  onChange={ev => changeValue({ diasTrabalhados: parseInt(ev.target.value || '0') || 0 })}
                />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Regime Previdência</span>
                </Label>
                <Select value={params.regime_tributario} onValueChange={(v: any) => changeValue({ regime_tributario: String(v) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Regime Previdência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">RPC (Funpresp)</SelectItem>
                    <SelectItem value="2">RPPS sem limite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Aliquota Complementar</span>
                  <span className="" onClick={() => changeValue({ complementar: 0 })}>0,00</span>
                  <span className="" onClick={() => changeValue({ complementar: 8.5 })}>8,50</span>
                </Label>
                <Input
                  value={(params.complementar).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ complementar: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })} />
              </div>
              <div className="ml-auto"></div>
              <FormProventos onSave={r => setOutrasReceitas(old => ([...old, { ...r, id: Math.random().toString() }]))}>
                <Button variant={'outline'}><PlusIcon /> provento</Button>
              </FormProventos>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableBody>
                {sortBy(receitas, 'value').reverse().filter(r => r.value > 0).map(r => (
                  <TableRow key={r.name}>
                    <TableCell className="uppercase group pl-10 font-light">
                      {r.name}
                      {r.id && (
                        <span onClick={() => removeOutrasReceitasById(r.id || '')} className="ml-4 lowercase opacity-0 group-hover:opacity-100 cursor-pointer">excluir</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end font-bold">{formatNumber(r.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableHead className="bg-accent">Receita bruta</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(receitas, 'value'))}</TableHead>
                </TableRow>
                {sortBy(descontos, 'value').filter(d => d.value > 0).reverse().map(d => (
                  <TableRow>
                    <TableCell className="uppercase pl-10 font-light">{d.name}</TableCell>
                    <TableCell className="text-end font-bold">{formatNumber(d.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableHead className="bg-accent">Descontos</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(descontos, 'value'))}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-accent">Líquido</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(receitas, 'value') - sumBy(descontos, 'value'))}</TableHead>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
