<?php
/**
 * Yoast SEO integration for Pascal Roth field-driven pages.
 *
 * @package Leadwerk_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Canonical SEO profiles per Pascal source key.
 *
 * @return array<string,array<string,string>>
 */
function leadwerk_theme_get_pascal_seo_profiles() {
	return apply_filters(
		'leadwerk_theme_pascal_seo_profiles',
		array(
			'pascal-home-v1'                => array(
				'focus_keyphrase'  => 'Finanzberatung Karlsruhe',
				'seo_title'        => 'Finanzberatung Karlsruhe: Pascal Roth · Beratung nach Lebensphasen',
				'meta_description' => 'Finanzberatung Karlsruhe mit Pascal Roth: persönliche Finanzplanung nach Lebensphasen, verständlich und ohne Verkaufsdruck.',
			),
			'pascal-berufseinstieg-v1'      => array(
				'focus_keyphrase'  => 'Finanzberatung für Berufseinsteiger',
				'seo_title'        => 'Finanzberatung für Berufseinsteiger | Pascal Roth Karlsruhe',
				'meta_description' => 'Finanzberatung für Berufseinsteiger in Karlsruhe: Absicherung, Vorsorge und Vermögensaufbau – verständlich und ohne Druck.',
			),
			'pascal-junge-familie-v1'       => array(
				'focus_keyphrase'  => 'Finanzberatung für junge Familien',
				'seo_title'        => 'Finanzberatung für junge Familien | Pascal Roth Karlsruhe',
				'meta_description' => 'Finanzberatung für junge Familien in Karlsruhe: Absicherung, Vorsorge und Vermögensaufbau – verständlich und ohne Druck.',
			),
			'pascal-kinder-v1'              => array(
				'focus_keyphrase'  => 'Vorsorge für Kinder',
				'seo_title'        => 'Vorsorge für Kinder | Schutz & Vermögensaufbau · Pascal Roth',
				'meta_description' => 'Vorsorge für Kinder ohne Produktdschungel: Schutz, Vermögensaufbau und Zukunftsplanung mit Pascal Roth in Karlsruhe.',
			),
			'pascal-selbststaendigkeit-v1'  => array(
				'focus_keyphrase'  => 'Finanzberatung für Selbständige',
				'seo_title'        => 'Finanzberatung für Selbständige | Pascal Roth Karlsruhe',
				'meta_description' => 'Finanzberatung für Selbständige in Karlsruhe: Absicherung, Vorsorge, Rücklagen und Vermögensaufbau – verständlich und ohne Druck.',
			),
			'pascal-vermoegen-v1'           => array(
				'focus_keyphrase'  => 'Vermögen aufbauen',
				'seo_title'        => 'Vermögen aufbauen mit Strategie | Pascal Roth Karlsruhe',
				'meta_description' => 'Vermögen aufbauen mit klarer Strategie: Sparplan, Investment und Finanzplanung mit Pascal Roth in Karlsruhe – ohne Hype und Druck.',
			),
			'pascal-spaetstarter-50plus-v1' => array(
				'focus_keyphrase'  => 'Spätstarter 50+',
				'seo_title'        => 'Spätstarter 50+ · Finanzplanung | Pascal Roth Karlsruhe',
				'meta_description' => 'Spätstarter 50+ neu sortieren: Rentenlücke einordnen und Finanzplanung ruhig angehen – Finanzberatung in Karlsruhe mit Pascal Roth.',
			),
			'pascal-spaetstarter-v1'        => array(
				'focus_keyphrase'  => 'Finanzberatung Karlsruhe',
				'seo_title'        => 'Spätstarter 50+ & Finanzberatung Karlsruhe | Pascal Roth',
				'meta_description' => 'Finanzberatung Karlsruhe ab 50+: Altersvorsorge und Finanzplanung ehrlich einordnen – mit Pascal Roth, verständlich und ohne Druck.',
			),
			'pascal-veraenderung-v1'        => array(
				'focus_keyphrase'  => 'Finanzberatung Karlsruhe',
				'seo_title'        => 'Lebensveränderung & Finanzberatung Karlsruhe | Pascal Roth',
				'meta_description' => 'Finanzberatung Karlsruhe bei Lebensveränderung: Finanzen nach Trennung, Jobwechsel oder Umzug neu sortieren – ruhig und strukturiert.',
			),
			'pascal-ueber-v1'               => array(
				'focus_keyphrase'  => 'Finanzberatung Karlsruhe',
				'seo_title'        => 'Über Pascal Roth | Finanzberatung in Karlsruhe',
				'meta_description' => 'Finanzberatung Karlsruhe mit Pascal Roth: persönlich, verständlich und ohne Verkaufsdruck – für Absicherung, Vorsorge und Vermögensaufbau.',
			),
			'pascal-kontakt-v1'             => array(
				'focus_keyphrase'  => 'Finanzberatung Karlsruhe',
				'seo_title'        => 'Kontakt | Finanzberatung Karlsruhe · Pascal Roth',
				'meta_description' => 'Finanzberatung Karlsruhe: Kontakt zu Pascal Roth für ein kostenloses Erstgespräch – telefonisch, per E-Mail oder online.',
			),
		)
	);
}

/**
 * SEO profile for one source key.
 *
 * @param string $source_key Source key.
 * @return array<string,string>
 */
function leadwerk_theme_get_pascal_seo_profile( $source_key ) {
	$profiles   = leadwerk_theme_get_pascal_seo_profiles();
	$source_key = sanitize_key( (string) $source_key );

	return isset( $profiles[ $source_key ] ) && is_array( $profiles[ $source_key ] )
		? $profiles[ $source_key ]
		: array();
}

/**
 * Sync Yoast post meta from canonical Pascal SEO profile when fields are empty.
 *
 * @param int $post_id Post ID.
 * @return void
 */
function leadwerk_theme_maybe_sync_pascal_yoast_meta( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id <= 0 || ! is_admin() ) {
		return;
	}

	$source_key = sanitize_key( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) );
	$profile    = leadwerk_theme_get_pascal_seo_profile( $source_key );
	if ( empty( $profile ) ) {
		return;
	}

	if ( ! empty( $profile['focus_keyphrase'] ) && '' === trim( (string) get_post_meta( $post_id, '_yoast_wpseo_focuskw', true ) ) ) {
		update_post_meta( $post_id, '_yoast_wpseo_focuskw', sanitize_text_field( $profile['focus_keyphrase'] ) );
	}

	if ( ! empty( $profile['seo_title'] ) ) {
		$current_title = trim( (string) get_post_meta( $post_id, '_yoast_wpseo_title', true ) );
		$focus         = trim( (string) ( $profile['focus_keyphrase'] ?? '' ) );
		if ( '' === $current_title || ( '' !== $focus && 0 !== stripos( $current_title, $focus ) ) ) {
			$seo_title = function_exists( 'leadwerk_theme_truncate_seo_title_for_yoast' )
				? leadwerk_theme_truncate_seo_title_for_yoast( $profile['seo_title'] )
				: $profile['seo_title'];
			update_post_meta( $post_id, '_yoast_wpseo_title', sanitize_text_field( $seo_title ) );
		}
	}

	if ( ! empty( $profile['meta_description'] ) ) {
		$current_desc = trim( (string) get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ) );
		if ( '' === $current_desc || ( ! empty( $profile['focus_keyphrase'] ) && false === stripos( $current_desc, (string) $profile['focus_keyphrase'] ) ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_metadesc', sanitize_text_field( $profile['meta_description'] ) );
		}
	}

	if ( function_exists( 'leadwerk_theme_rebuild_yoast_post_indexable' ) ) {
		leadwerk_theme_rebuild_yoast_post_indexable( $post_id );
	}
}

/**
 * Build rendered HTML for Yoast content analysis (main + nav/footer chrome).
 *
 * @param int $post_id Post ID.
 * @return string
 */
function leadwerk_theme_build_yoast_analysis_html( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id <= 0 || ! class_exists( 'Leadwerk_Content_Schema' ) || ! function_exists( 'get_field' ) ) {
		return '';
	}

	$group = Leadwerk_Content_Schema::get_group_for_post( $post_id );
	if ( ! $group || empty( $group['field_name'] ) ) {
		return '';
	}

	$source_key = sanitize_key( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) );
	$content    = '';

	if ( function_exists( 'leadwerk_theme_is_pascal_source_key' ) && leadwerk_theme_is_pascal_source_key( $source_key ) && function_exists( 'leadwerk_theme_pascal_extract_chrome_html' ) ) {
		$header = leadwerk_theme_pascal_extract_chrome_html( $source_key, 'header' );
		if ( '' === trim( $header ) && 'pascal-home-v1' !== $source_key ) {
			$header = leadwerk_theme_pascal_extract_chrome_html( 'pascal-home-v1', 'header' );
		}
		$content .= $header . "\n";
	}

	if ( function_exists( 'leadwerk_theme_render_current_page_content' ) ) {
		$content .= leadwerk_theme_render_current_page_content( $post_id );
	}

	if ( function_exists( 'leadwerk_theme_is_pascal_source_key' ) && leadwerk_theme_is_pascal_source_key( $source_key ) && function_exists( 'leadwerk_theme_pascal_extract_chrome_html' ) ) {
		$footer = leadwerk_theme_pascal_extract_chrome_html( $source_key, 'footer' );
		if ( '' === trim( $footer ) ) {
			$footer = leadwerk_theme_pascal_extract_chrome_html( 'pascal-home-v1', 'footer' );
		}
		$content .= "\n" . $footer;
	}

	if ( '' === trim( wp_strip_all_tags( $content ) ) && false === stripos( $content, '<img' ) ) {
		return '';
	}

	$content = (string) preg_replace( '#<script[^>]*>.*?</script>#is', '', $content );
	$content = (string) preg_replace( '#<style[^>]*>.*?</style>#is', '', $content );

	$clean_content = wp_kses_post( $content );
	$clean_content = (string) str_replace( array( "\r", "\n", "\t" ), ' ', $clean_content );
	$clean_content = (string) preg_replace( '/\s+/', ' ', $clean_content );

	return trim( $clean_content );
}

/**
 * Yoast SEO title override for Pascal pages.
 *
 * @param string $title Title.
 * @return string
 */
function leadwerk_theme_filter_yoast_seo_title( $title ) {
	if ( is_admin() || ! is_singular( 'page' ) ) {
		return $title;
	}

	$post_id = (int) get_queried_object_id();
	$profile = leadwerk_theme_get_pascal_seo_profile( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) );
	if ( empty( $profile['seo_title'] ) ) {
		return $title;
	}

	$stored = trim( (string) get_post_meta( $post_id, '_yoast_wpseo_title', true ) );
	if ( '' !== $stored ) {
		return $title;
	}

	return (string) $profile['seo_title'];
}
add_filter( 'wpseo_title', 'leadwerk_theme_filter_yoast_seo_title', 20 );
add_filter( 'wpseo_opengraph_title', 'leadwerk_theme_filter_yoast_seo_title', 20 );

/**
 * Yoast meta description override for Pascal pages.
 *
 * @param string $description Description.
 * @return string
 */
function leadwerk_theme_filter_yoast_metadesc( $description ) {
	if ( is_admin() || ! is_singular( 'page' ) ) {
		return $description;
	}

	$post_id = (int) get_queried_object_id();
	$profile = leadwerk_theme_get_pascal_seo_profile( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) );
	if ( empty( $profile['meta_description'] ) ) {
		return $description;
	}

	$stored = trim( (string) get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ) );
	if ( '' !== $stored && ( empty( $profile['focus_keyphrase'] ) || false !== stripos( $stored, (string) $profile['focus_keyphrase'] ) ) ) {
		return $description;
	}

	return (string) $profile['meta_description'];
}
add_filter( 'wpseo_metadesc', 'leadwerk_theme_filter_yoast_metadesc', 20 );
add_filter( 'wpseo_opengraph_desc', 'leadwerk_theme_filter_yoast_metadesc', 20 );
