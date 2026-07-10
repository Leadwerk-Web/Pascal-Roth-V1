<?php
/**
 * Social sharing previews (Open Graph / Twitter) for Leadwerk pages.
 *
 * @package Leadwerk_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Default share image for Pascal Roth pages.
 *
 * @return string Absolute URL.
 */
function leadwerk_theme_get_default_social_image_url() {
	return leadwerk_theme_static_asset_url( 'Fotos/Auf Website genutzt/Hero_About.webp' );
}

/**
 * Resolve a relative og:image path from a static shell file.
 *
 * @param string $raw_value    Raw meta content from HTML.
 * @param string $source_file  Shell path relative to static root.
 * @return string Absolute URL or empty.
 */
function leadwerk_theme_resolve_shell_og_image_url( $raw_value, $source_file = '' ) {
	$raw_value = html_entity_decode( trim( (string) $raw_value ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	if ( '' === $raw_value ) {
		return '';
	}

	if ( preg_match( '#^https?://#i', $raw_value ) ) {
		return esc_url_raw( $raw_value );
	}

	$relative = function_exists( 'leadwerk_theme_pascal_resolve_relative_path' )
		? leadwerk_theme_pascal_resolve_relative_path( $raw_value, (string) $source_file )
		: ltrim( str_replace( '\\', '/', (string) $raw_value ), './' );

	if ( '' === $relative ) {
		return '';
	}

	return esc_url_raw( leadwerk_theme_static_asset_url( $relative ) );
}

/**
 * Parse og:image from a static shell HTML file.
 *
 * @param string $source_file Shell path relative to static root.
 * @return string Absolute URL or empty.
 */
function leadwerk_theme_parse_shell_og_image_url( $source_file ) {
	$source_file = ltrim( str_replace( '\\', '/', (string) $source_file ), '/' );
	if ( '' === $source_file ) {
		return '';
	}

	$path = function_exists( 'leadwerk_theme_resolve_exact_shell_file' )
		? leadwerk_theme_resolve_exact_shell_file( $source_file )
		: '';

	if ( '' === $path || ! is_readable( $path ) ) {
		$base = leadwerk_theme_get_static_source_base();
		$path = trailingslashit( $base['dir'] ) . $source_file;
	}

	if ( ! is_file( $path ) || ! is_readable( $path ) ) {
		return '';
	}

	$html = (string) file_get_contents( $path );
	if ( '' === $html ) {
		return '';
	}

	if ( ! preg_match( '#<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $matches )
		&& ! preg_match( '#<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']#i', $html, $matches ) ) {
		return '';
	}

	return leadwerk_theme_resolve_shell_og_image_url( $matches[1], $source_file );
}

/**
 * First hero/background image URL from structured page fields.
 *
 * @param int $post_id Post ID.
 * @return string Absolute URL or empty.
 */
function leadwerk_theme_get_page_hero_image_url( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id <= 0 || ! function_exists( 'get_field' ) || ! class_exists( 'Leadwerk_Content_Schema' ) ) {
		return '';
	}

	$group = Leadwerk_Content_Schema::get_group_for_post( $post_id );
	if ( ! $group || empty( $group['field_name'] ) ) {
		return '';
	}

	$sections = get_field( (string) $group['field_name'], $post_id );
	if ( ! is_array( $sections ) ) {
		return '';
	}

	foreach ( $sections as $section ) {
		if ( ! is_array( $section ) ) {
			continue;
		}

		foreach ( array( 'background_image', 'image' ) as $field_key ) {
			if ( empty( $section[ $field_key ] ) ) {
				continue;
			}

			$attachment_id = is_array( $section[ $field_key ] )
				? (int) ( $section[ $field_key ]['ID'] ?? 0 )
				: (int) $section[ $field_key ];

			if ( $attachment_id > 0 ) {
				$url = wp_get_attachment_image_url( $attachment_id, 'large' );
				if ( is_string( $url ) && '' !== $url ) {
					return esc_url_raw( $url );
				}
			}
		}
	}

	return '';
}

/**
 * Best social preview image for a Leadwerk page.
 *
 * @param int $post_id Post ID. Defaults to current queried object.
 * @return string Absolute URL or empty.
 */
function leadwerk_theme_get_page_social_image_url( $post_id = 0 ) {
	$post_id = $post_id ? (int) $post_id : (int) get_queried_object_id();
	if ( $post_id <= 0 ) {
		return is_front_page() ? leadwerk_theme_get_default_social_image_url() : '';
	}

	$stored = trim( (string) get_post_meta( $post_id, 'leadwerk_og_image', true ) );
	if ( '' !== $stored ) {
		return esc_url_raw( $stored );
	}

	$source_file = trim( (string) get_post_meta( $post_id, 'leadwerk_source_file', true ) );
	if ( '' !== $source_file ) {
		$parsed = leadwerk_theme_parse_shell_og_image_url( $source_file );
		if ( '' !== $parsed ) {
			return $parsed;
		}
	}

	$hero = leadwerk_theme_get_page_hero_image_url( $post_id );
	if ( '' !== $hero ) {
		return $hero;
	}

	if ( function_exists( 'leadwerk_theme_is_pascal_source_key' ) ) {
		$source_key = trim( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) );
		if ( leadwerk_theme_is_pascal_source_key( $source_key ) ) {
			return leadwerk_theme_get_default_social_image_url();
		}
	}

	return '';
}

/**
 * Whether the current request should use Leadwerk social preview overrides.
 *
 * @param int $post_id Post ID.
 * @return bool
 */
function leadwerk_theme_should_override_social_image( $post_id = 0 ) {
	$post_id = $post_id ? (int) $post_id : (int) get_queried_object_id();
	if ( $post_id <= 0 ) {
		return is_front_page() || is_home();
	}

	if ( trim( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) ) !== '' ) {
		return true;
	}

	if ( class_exists( 'Leadwerk_Content_Schema' ) && Leadwerk_Content_Schema::get_group_for_post( $post_id ) ) {
		return true;
	}

	return false;
}

/**
 * Yoast Open Graph / Twitter image override.
 *
 * @param string $image Current image URL.
 * @return string
 */
function leadwerk_theme_filter_yoast_social_image( $image ) {
	if ( is_admin() ) {
		return $image;
	}

	if ( ! leadwerk_theme_should_override_social_image() ) {
		return $image;
	}

	$custom = leadwerk_theme_get_page_social_image_url();
	if ( '' === $custom ) {
		return $image;
	}

	return $custom;
}
add_filter( 'wpseo_opengraph_image', 'leadwerk_theme_filter_yoast_social_image', 20 );
add_filter( 'wpseo_twitter_image', 'leadwerk_theme_filter_yoast_social_image', 20 );

/**
 * Prevent Yoast attachment ID from overriding our external static asset URL.
 *
 * @param string|int $image_id Attachment ID.
 * @return string|int
 */
function leadwerk_theme_filter_yoast_social_image_id( $image_id ) {
	if ( is_admin() || ! leadwerk_theme_should_override_social_image() ) {
		return $image_id;
	}

	$custom = leadwerk_theme_get_page_social_image_url();
	if ( '' !== $custom ) {
		return 0;
	}

	return $image_id;
}
add_filter( 'wpseo_opengraph_image_id', 'leadwerk_theme_filter_yoast_social_image_id', 20 );
add_filter( 'wpseo_twitter_image_id', 'leadwerk_theme_filter_yoast_social_image_id', 20 );
