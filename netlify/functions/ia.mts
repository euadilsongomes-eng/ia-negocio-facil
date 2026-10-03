export default async (req: Request) => {
  if (req.method !== "POST") return Response.json({error:"Método não permitido."},{status:405});
  const apiKey=Netlify.env.get("OPENAI_API_KEY");
  if(!apiKey) return Response.json({error:"OPENAI_API_KEY não configurada no Netlify."},{status:500});
  try{
    const body=await req.json();
    const produto=String(body?.produto||"").slice(0,300);
    const preco=String(body?.preco||"").slice(0,100);
    const objetivo=String(body?.objetivo||"Vender agora").slice(0,100);
    const canal=String(body?.canal||"WhatsApp").slice(0,50);
    const produtos=Array.isArray(body?.produtos)?body.produtos.slice(0,30):[];
    if(!produto)return Response.json({error:"Informe um produto ou serviço."},{status:400});
    const prompt=`Você é o Assistente de Vendas da plataforma IA Negócio Fácil para pequenos empreendedores brasileiros.
Crie uma campanha comercial em português do Brasil.
Produto/serviço: ${produto}
Preço/oferta: ${preco||"não informado"}
Objetivo: ${objetivo}
Canal: ${canal}
Produtos cadastrados: ${JSON.stringify(produtos)}
Não invente preço, desconto, estoque, prazo ou característica não informada.
Adapte ao canal, seja profissional e persuasivo, inclua chamada para ação e, em redes sociais, poucas hashtags.
Entregue somente o texto final pronto para copiar.`;
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-6-luna",input:prompt,max_output_tokens:500})});
    const data=await r.json();
    if(!r.ok)return Response.json({error:data?.error?.message||"Erro ao acessar a OpenAI."},{status:r.status});
    const texto=(data.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text||"").join("\n").trim();
    if(!texto)return Response.json({error:"A IA respondeu sem texto."},{status:502});
    return Response.json({texto});
  }catch{return Response.json({error:"Falha interna ao gerar a campanha."},{status:500})}
};
export const config={path:"/api/ia"};