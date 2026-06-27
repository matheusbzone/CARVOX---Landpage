import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Inicializa o cliente Supabase apenas se as chaves existirem
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar requisição OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabase) {
     return res.status(500).json({ error: 'Supabase credentials missing in Vercel environment' });
  }

  try {
    const data = req.body;
    
    if (!data || !data.proprietario || !data.imovel) {
      return res.status(400).json({ error: 'Missing required data (proprietario or imovel)' });
    }

    // 1. Obter ou Criar Tenant Padrão (SaaS Multi-Tenancy)
    let tenantId;
    const { data: tenantData, error: tenantErr } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'carvox-default')
      .single();

    if (tenantErr || !tenantData) {
      const { data: newTenant, error: createTenantErr } = await supabase
        .from('tenants')
        .insert([{ slug: 'carvox-default', name: 'CARVOX Consultoria Padrão', plan: 'enterprise' }])
        .select()
        .single();
        
      if (createTenantErr) throw createTenantErr;
      tenantId = newTenant.id;
    } else {
      tenantId = tenantData.id;
    }

    // 2. Criar ou Obter Produtor Rural
    let producerId;
    const cpfCnpj = data.proprietario.cpf || '00000000000';
    
    const { data: producerData, error: producerErr } = await supabase
      .from('rural_producers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('cpf_cnpj', cpfCnpj)
      .single();
      
    if (!producerErr && producerData) {
       producerId = producerData.id;
    } else {
       const { data: newProducer, error: createProducerErr } = await supabase
         .from('rural_producers')
         .insert([{
            tenant_id: tenantId,
            name: data.proprietario.nome || 'Produtor Sem Nome',
            cpf_cnpj: cpfCnpj,
            email: data.proprietario.email || null,
            phone: data.proprietario.telefone || null
         }])
         .select()
         .single();
         
       if (createProducerErr) throw createProducerErr;
       producerId = newProducer.id;
    }

    // 3. Criar Propriedade Rural
    const estadoStr = data.imovel.estado ? data.imovel.estado.substring(0, 2).toUpperCase() : 'SP';
    
    const { data: newProperty, error: propertyErr } = await supabase
      .from('rural_properties')
      .insert([{
         tenant_id: tenantId,
         rural_producer_id: producerId,
         name: data.imovel.nomePropriedade || 'Propriedade Sem Nome',
         state: estadoStr,
         municipality: data.imovel.municipio || 'Não Informado',
         total_area_ha: parseFloat(data.imovel.tamanhoArea) || null,
         notes: `Documentação: ${data.imovel.documentacao || 'N/A'}\nUso do Solo: ${data.imovel.usoSolo || 'N/A'}`,
         metadata: data.areasAmbientais || {}
      }])
      .select()
      .single();

    if (propertyErr) throw propertyErr;

    return res.status(200).json({ 
      success: true, 
      id: newProperty.id,
      message: 'Dados salvos na arquitetura SaaS (Supabase) com sucesso!' 
    });
  } catch (error: any) {
    console.error("Erro ao salvar no Supabase:", error);
    return res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
}
