<?php
/**
 * 404 template.
 *
 * @package Leadwerk_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

if ( function_exists( 'leadwerk_theme_render_pascal_404_shell_content' ) ) {
	echo leadwerk_theme_render_pascal_404_shell_content(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static shell is normalized by renderer.
} else {
	?>
	<main class="pascal-roth-page">
		<section class="section">
			<div style="max-width:960px;margin:0 auto;padding:140px 20px 80px;">
				<h1><?php esc_html_e( '404', 'leadwerk-theme' ); ?></h1>
				<p><?php esc_html_e( 'Diese Seite wurde nicht gefunden.', 'leadwerk-theme' ); ?></p>
				<p><a class="btn-primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Zur Startseite', 'leadwerk-theme' ); ?></a></p>
			</div>
		</section>
	</main>
	<?php
}

get_footer();
