// @ts-nocheck
// Supabase Edge Function: crear-policia
// Crea una cuenta de policía con privilegios de service_role.
// Solo puede ser invocada por un ADMIN activo.
// NOTA: Este archivo corre en Deno (Supabase Edge Runtime), NO en Node.js.
// Los errores de VS Code sobre 'Deno' y 'https://' imports son falsos positivos.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verificar que quien llama es un ADMIN activo
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó token de autorización' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cliente con el JWT del invocador (para verificar rol)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabaseInvocador = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Obtener usuario autenticado
    const { data: { user: invocador }, error: errorAuth } = await supabaseInvocador.auth.getUser();
    if (errorAuth || !invocador) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que sea ADMIN activo
    const { data: perfilAdmin, error: errorPerfil } = await supabaseInvocador
      .from('usuarios')
      .select('rol, activo')
      .eq('id_usuario', invocador.id)
      .single();

    if (errorPerfil || !perfilAdmin || perfilAdmin.rol !== 'ADMIN' || !perfilAdmin.activo) {
      return new Response(
        JSON.stringify({ error: 'Solo un administrador activo puede crear policías' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Leer datos del body
    const { nombres, apellidos, correo, password, tipo_policia } = await req.json();

    // Validaciones básicas
    if (!nombres || !apellidos || !correo || !password) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos obligatorios: nombres, apellidos, correo, password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Crear usuario en auth usando service_role (nunca expuesta al cliente)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: nuevoAuth, error: errorCrear } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: password,
      email_confirm: true,
    });

    if (errorCrear) {
      return new Response(
        JSON.stringify({ error: `Error al crear cuenta: ${errorCrear.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Insertar fila en public.usuarios
    const { data: nuevoUsuario, error: errorInsert } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id_usuario: nuevoAuth.user.id,
        rol: 'POLICIA',
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        tipo_policia: tipo_policia || null,
        activo: true,
      })
      .select()
      .single();

    if (errorInsert) {
      // Revertir: eliminar usuario de auth para no dejar cuentas huérfanas
      await supabaseAdmin.auth.admin.deleteUser(nuevoAuth.user.id);
      return new Response(
        JSON.stringify({ error: `Error al registrar perfil: ${errorInsert.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Retornar el usuario creado
    return new Response(
      JSON.stringify({ usuario: nuevoUsuario }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({ error: mensaje }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
