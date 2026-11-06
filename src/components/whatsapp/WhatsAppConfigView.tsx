import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  MessageSquare,
  QrCode,
  Smartphone,
  Battery,
  Wifi,
  Send,
  CheckCheck,
  ShieldCheck,
  RefreshCw,
  Sliders,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const WhatsAppConfigView: React.FC = () => {
  const {
    activeTenant,
    activeWhatsAppInstance,
    toggleWhatsAppTemplate,
    sendWhatsAppManualMessage,
    simulateIncomingWebhook,
  } = useApp();

  const [testPhone, setTestPhone] = useState('(11) 98765-4321');
  const [testMessage, setTestMessage] = useState('🍕 Teste de notificação da Evolution API: seu pedido está saindo do forno!');

  if (!activeWhatsAppInstance) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-slate-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p className="font-bold">Nenhuma instância configurada para esta pizzaria.</p>
      </div>
    );
  }

  const handleSendTest = () => {
    if (testPhone && testMessage) {
      sendWhatsAppManualMessage(testPhone, testMessage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Integração WhatsApp Evolution API
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {activeTenant.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instância Baileys multiempresa isolada para envio de notificações automáticas e links de rastreamento.
          </p>
        </div>

        <button
          onClick={simulateIncomingWebhook}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Testar Webhook "messages.upsert"
        </button>
      </div>

      {/* Grid Principal: Status da Conexão & Gatilhos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel da Instância / Celular */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Sessão da Evolution API
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Conectado
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
              <span className="text-slate-600">Nome da Instância:</span>
              <span className="font-mono font-bold text-slate-900">{activeWhatsAppInstance.instanceName}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
              <span className="text-slate-600">Número Conectado:</span>
              <span className="font-mono font-bold text-slate-900">{activeWhatsAppInstance.connectedNumber}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
              <span className="text-slate-600">Bateria do Celular:</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                <Battery className="w-4 h-4 text-emerald-500" />
                {activeWhatsAppInstance.batteryLevel}%
              </span>
            </div>

            {/* Caixa de Proteção Anti-Ban e LGPD */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1.5 text-[11px] text-blue-900">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Proteção Anti-Ban Ativada
              </div>
              <p className="text-blue-800 leading-relaxed">
                As mensagens são disparadas com fila assíncrona (BullMQ/Redis) e atraso randômico entre 1,5s e 3s. Somente notificações transacionais consentidas pelo cliente no checkout.
              </p>
            </div>
          </div>

          {/* Teste Rápido de Disparo */}
          <div className="pt-3 border-t space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Simulador de Disparo Manual
            </span>
            <input
              type="text"
              placeholder="Telefone (DDD + Número)"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs"
            />
            <textarea
              rows={2}
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs"
            />
            <button
              onClick={handleSendTest}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar Mensagem de Teste
            </button>
          </div>
        </div>

        {/* Modelos de Mensagens e Gatilhos */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Gatilhos de Notificações Automáticas
            </h3>
            <span className="text-xs text-slate-500 font-medium">Ative ou pause cada evento</span>
          </div>

          <div className="space-y-3">
            {activeWhatsAppInstance.templates.map(tmpl => (
              <div
                key={tmpl.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{tmpl.title}</span>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                      {tmpl.trigger}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs font-mono leading-relaxed bg-white p-2 rounded border border-slate-200/60">
                    {tmpl.template}
                  </p>
                </div>

                <button
                  onClick={() => toggleWhatsAppTemplate(tmpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    tmpl.enabled
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {tmpl.enabled ? 'Ativo' : 'Pausado'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico e Logs de Mensagens em Tempo Real */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          Log de Envios Recentes da Instância
        </h3>

        <div className="space-y-2">
          {activeWhatsAppInstance.logs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.phone}</span>
                  <span className="text-slate-400">· {log.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-mono text-[11px]">{log.message}</p>
              </div>

              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] shrink-0">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                {log.status === 'DELIVERED' ? 'Entregue' : 'Enviado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
