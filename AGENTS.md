<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Payments: Mercado Pago Checkout Pro via server fns in `src/lib/shop.functions.ts`; order state only changes from MP API lookups (`src/lib/mp.server.ts`), never from browser return params — prevents fake approvals.
- Delivery: buyers access `/pedido/$id?t=<access_token>`; PDF lives in private bucket and is served via short-lived signed URLs — no buyer accounts needed.
- Admin: role in `user_roles`; first created auth user becomes admin; public signup disabled. Admin writes go through RLS from the browser.
