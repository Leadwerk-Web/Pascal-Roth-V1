<?php
/**
 * Pascal Roth structured data (JSON-LD) from static shell sources.
 *
 * @package Leadwerk_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Debug log for schema output (local dev only when log path is writable).
 *
 * @param string               $hypothesis_id Hypothesis id.
 * @param string               $message       Message.
 * @param array<string,mixed>  $data          Data.
 * @return void
 */
function leadwerk_theme_pascal_schema_debug_log( $hypothesis_id, $message, $data = array() ) {
	// #region agent log
	$log_path = wp_normalize_path( LEADWERK_THEME_DIR . '/../../.cursor/debug-09b519.log' );
	if ( ! is_writable( dirname( $log_path ) ) && ! is_file( $log_path ) ) {
		return;
	}
	$payload = array(
		'sessionId'    => '09b519',
		'hypothesisId' => (string) $hypothesis_id,
		'location'     => 'pascal-structured-data.php',
		'message'      => (string) $message,
		'data'         => is_array( $data ) ? $data : array(),
		'timestamp'    => (int) round( microtime( true ) * 1000 ),
	);
	file_put_contents( $log_path, wp_json_encode( $payload ) . "\n", FILE_APPEND | LOCK_EX );
	// #endregion
}

/**
 * Supplemental schemas not stored in shell head.
 *
 * @param string $source_key Source key.
 * @return array<int,array<string,mixed>>
 */
function leadwerk_theme_pascal_get_supplemental_schemas( $source_key ) {
	$schemas = array();

	if ( 'pascal-home-v1' === $source_key ) {
		$schemas[] = array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => array(
				array(
					'@type'          => 'Question',
					'name'           => 'Ist das Erstgespräch wirklich kostenlos?',
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => 'Ja. Wir lernen uns kennen. Ohne Verpflichtung, ohne Verkauf, ohne Haken.',
					),
				),
				array(
					'@type'          => 'Question',
					'name'           => 'Muss ich im Erstgespräch etwas abschließen?',
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => 'Nein. Im Erstgespräch wird nichts unterschrieben. Ich berate, du entscheidest, in deinem Tempo.',
					),
				),
				array(
					'@type'          => 'Question',
					'name'           => 'Geht das nur vor Ort in Karlsruhe oder auch digital?',
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => 'Beides geht: persönlich in Karlsruhe oder digital per Video, Telefon oder E-Mail. Ganz, wie es zu deinem Alltag passt.',
					),
				),
				array(
					'@type'          => 'Question',
					'name'           => 'Was kostet die Beratung nach dem kostenlosen Erstgespräch?',
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => 'Das Erstgespräch bleibt unverbindlich. Wenn wir tiefer einsteigen, erkläre ich dir vorher genau, wie die Zusammenarbeit vergütet wird. Keine Überraschungen, kein Kleingedrucktes.',
					),
				),
			),
		);
	}

	return $schemas;
}

/**
 * Extract JSON-LD blocks from a Pascal shell HTML head.
 *
 * @param string $source_key Source key.
 * @return array<int,array<string,mixed>>
 */
function leadwerk_theme_pascal_extract_shell_json_ld( $source_key ) {
	if ( ! function_exists( 'leadwerk_theme_pascal_get_shell_html' ) ) {
		return array();
	}

	$html = leadwerk_theme_pascal_get_shell_html( $source_key );
	if ( '' === trim( $html ) ) {
		return array();
	}

	if ( ! preg_match_all( '#<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>#is', $html, $matches ) ) {
		return array();
	}

	$blocks = array();
	foreach ( (array) $matches[1] as $raw_json ) {
		$decoded = json_decode( trim( (string) $raw_json ), true );
		if ( is_array( $decoded ) && ! empty( $decoded ) ) {
			$blocks[] = $decoded;
		}
	}

	return $blocks;
}

/**
 * Normalize one JSON-LD value recursively for WordPress URLs.
 *
 * @param mixed  $value        Value.
 * @param string $context_file Source file.
 * @param string $key          Parent key.
 * @return mixed
 */
function leadwerk_theme_pascal_normalize_json_ld_value( $value, $context_file, $key = '' ) {
	if ( is_array( $value ) ) {
		$normalized = array();
		foreach ( $value as $child_key => $child_value ) {
			$normalized[ $child_key ] = leadwerk_theme_pascal_normalize_json_ld_value( $child_value, $context_file, (string) $child_key );
		}
		return $normalized;
	}

	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return $value;
	}

	$trimmed = trim( $value );

	if ( preg_match( '#^https?://(?:www\.)?pascal-roth\.de(/.*)?$#i', $trimmed, $match ) ) {
		$path = isset( $match[1] ) ? ltrim( (string) $match[1], '/' ) : '';
		if ( '' === $path ) {
			return home_url( '/' );
		}
		if ( function_exists( 'leadwerk_theme_pascal_source_key_for_file' ) ) {
			$file_key = leadwerk_theme_pascal_source_key_for_file( $path );
			if ( '' !== $file_key && function_exists( 'leadwerk_theme_get_page_url' ) ) {
				return leadwerk_theme_get_page_url( $file_key, leadwerk_theme_get_current_lang(), home_url( '/' . $path ) );
			}
		}
		return home_url( '/' . $path );
	}

	$url_keys = array( 'url', 'image', '@id', 'contentUrl', 'thumbnailUrl' );
	if ( in_array( $key, $url_keys, true ) || preg_match( '#^(?:Fotos/|\.\./|\./)#', $trimmed ) ) {
		if ( function_exists( 'leadwerk_theme_pascal_map_asset_to_url' ) && ! preg_match( '#^https?://#i', $trimmed ) ) {
			return leadwerk_theme_pascal_map_asset_to_url( $trimmed, $context_file );
		}
	}

	return $value;
}

/**
 * Collect all JSON-LD blocks for the current Pascal page.
 *
 * @param int $post_id Post ID.
 * @return array<int,array<string,mixed>>
 */
function leadwerk_theme_pascal_collect_structured_data( $post_id = 0 ) {
	$post_id = $post_id ? (int) $post_id : (int) get_queried_object_id();
	if ( $post_id <= 0 && ! is_404() ) {
		return array();
	}

	$source_key = $post_id > 0 ? sanitize_key( (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) ) : '';
	if ( '' === $source_key && is_404() ) {
		$source_key = 'pascal-404-v1';
	}

	if ( ! function_exists( 'leadwerk_theme_is_pascal_source_key' ) || ! leadwerk_theme_is_pascal_source_key( $source_key ) ) {
		return array();
	}

	$context_file = function_exists( 'leadwerk_theme_pascal_source_file' )
		? leadwerk_theme_pascal_source_file( $source_key )
		: '';

	$blocks = leadwerk_theme_pascal_extract_shell_json_ld( $source_key );
	foreach ( leadwerk_theme_pascal_get_supplemental_schemas( $source_key ) as $supplement ) {
		$type = (string) ( $supplement['@type'] ?? '' );
		$exists = false;
		foreach ( $blocks as $existing ) {
			if ( $type === (string) ( $existing['@type'] ?? '' ) ) {
				$exists = true;
				break;
			}
		}
		if ( ! $exists ) {
			$blocks[] = $supplement;
		}
	}

	$normalized = array();
	foreach ( $blocks as $block ) {
		$item = leadwerk_theme_pascal_normalize_json_ld_value( $block, $context_file );
		if ( is_array( $item ) ) {
			if ( in_array( (string) ( $item['@type'] ?? '' ), array( 'FinancialService', 'LocalBusiness', 'Organization' ), true ) && empty( $item['url'] ) ) {
				$item['url'] = home_url( '/' );
			}
			$normalized[] = $item;
		}
	}

	return $normalized;
}

/**
 * Output Pascal JSON-LD in wp_head.
 *
 * @return void
 */
function leadwerk_theme_pascal_output_structured_data() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	$post_id = is_singular( 'page' ) ? (int) get_queried_object_id() : 0;
	if ( $post_id <= 0 && ! is_404() ) {
		leadwerk_theme_pascal_schema_debug_log(
			'A',
			'schema_skipped_not_page',
			array(
				'is_front_page' => is_front_page(),
				'is_home'       => is_home(),
			)
		);
		return;
	}

	$blocks = leadwerk_theme_pascal_collect_structured_data( $post_id );
	$types  = array();
	foreach ( $blocks as $block ) {
		$types[] = (string) ( $block['@type'] ?? 'unknown' );
	}

	leadwerk_theme_pascal_schema_debug_log(
		'A',
		'schema_blocks_collected',
		array(
			'post_id'     => $post_id,
			'source_key'  => $post_id > 0 ? (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) : '404',
			'block_count' => count( $blocks ),
			'types'       => $types,
		)
	);

	if ( empty( $blocks ) ) {
		leadwerk_theme_pascal_schema_debug_log( 'B', 'schema_empty_no_shell_json_ld', array( 'post_id' => $post_id ) );
		return;
	}

	foreach ( $blocks as $block ) {
		echo '<script type="application/ld+json">' . wp_json_encode( $block, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
	}

	leadwerk_theme_pascal_schema_debug_log(
		'C',
		'schema_output_complete',
		array(
			'post_id' => $post_id,
			'types'   => $types,
		)
	);
}
add_action( 'wp_head', 'leadwerk_theme_pascal_output_structured_data', 99 );
