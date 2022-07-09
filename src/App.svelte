<script>
	import Index from "./component/Index.svelte"
	import Profile from "./component/Profile.svelte"

	let path = location.pathname
</script>
{ #if path === "/" }
<Index />
{ :else if path === "/profile" }
<Profile />
{ :else }
Error 404 Not Found
{ /if }