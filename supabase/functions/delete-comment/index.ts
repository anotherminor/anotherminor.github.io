import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let payload: { id?: string; password?: string };
  try {
    payload = await req.json();
  } catch (_err) {
    return json({ message: "잘못된 요청 본문입니다." }, 400);
  }

  const { id, password } = payload;
  if (!id || !password) {
    return json({ message: "댓글 ID와 비밀번호를 모두 입력해주세요." }, 400);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: comment, error: selectError } = await sb
    .from("comments")
    .select("password_hash")
    .eq("id", id)
    .maybeSingle();

  if (selectError) {
    return json({ message: "댓글을 조회하지 못했습니다." }, 500);
  }

  if (!comment) {
    return json({ message: "댓글을 찾을 수 없습니다." }, 404);
  }

  // 비밀번호 해시 비교
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  if (hashHex !== comment.password_hash) {
    return json({ message: "비밀번호가 틀렸습니다." }, 403);
  }

  const { error: deleteError } = await sb.from("comments").delete().eq("id", id);
  if (deleteError) {
    return json({ message: "댓글을 삭제하지 못했습니다." }, 500);
  }

  return json({ ok: true });
});
