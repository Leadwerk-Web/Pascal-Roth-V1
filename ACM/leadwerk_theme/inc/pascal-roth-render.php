<?php
/**
 * Pascal Roth static HTML renderer.
 *
 * @package Leadwerk_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pascal Roth page source map.
 *
 * @return array<string,string>
 */
function leadwerk_theme_pascal_source_map() {
	return apply_filters(
		'leadwerk_theme_pascal_source_map',
		array(
			'pascal-home-v1'                   => 'index.html',
			'pascal-ueber-v1'                  => 'ueber-pascal/index.html',
			'pascal-kontakt-v1'                => 'kontakt/index.html',
			'pascal-berufseinstieg-v1'         => 'lebensphasen/berufseinstieg/index.html',
			'pascal-junge-familie-v1'          => 'lebensphasen/junge-familie/index.html',
			'pascal-kinder-v1'                 => 'lebensphasen/kinder/index.html',
			'pascal-selbststaendigkeit-v1'     => 'lebensphasen/selbststaendigkeit/index.html',
			'pascal-vermoegen-v1'              => 'lebensphasen/vermoegen-aufbauen/index.html',
			'pascal-spaetstarter-v1'           => 'lebensphasen/spaetstarter/index.html',
			'pascal-spaetstarter-50plus-v1'    => 'lebensphasen/spaetstarter-50plus/index.html',
			'pascal-veraenderung-v1'           => 'lebensphasen/veraenderung/index.html',
			'pascal-impressum-v1'              => 'impressum/index.html',
			'pascal-datenschutz-v1'            => 'datenschutz/index.html',
			'pascal-danke-v1'                  => 'danke/index.html',
			'pascal-legal-v1'                  => 'legal/index.html',
			'pascal-404-v1'                    => '404.html',
		)
	);
}

/**
 * Whether a source key belongs to Pascal Roth.
 *
 * @param string $source_key Source key.
 * @return bool
 */
function leadwerk_theme_is_pascal_source_key( $source_key = '' ) {
	$source_key = '' !== $source_key ? (string) $source_key : ( function_exists( 'leadwerk_theme_get_current_source_key' ) ? leadwerk_theme_get_current_source_key() : '' );
	return isset( leadwerk_theme_pascal_source_map()[ $source_key ] );
}

/**
 * Source file for a Pascal source key.
 *
 * @param string $source_key Source key.
 * @return string
 */
function leadwerk_theme_pascal_source_file( $source_key ) {
	$map = leadwerk_theme_pascal_source_map();
	return isset( $map[ $source_key ] ) ? (string) $map[ $source_key ] : '';
}

/**
 * Source key for a normalized file path.
 *
 * @param string $file File path.
 * @return string
 */
function leadwerk_theme_pascal_source_key_for_file( $file ) {
	$file = leadwerk_theme_pascal_normalize_relative_path( $file );
	if ( '' !== $file && '/' === substr( $file, -1 ) ) {
		$file .= 'index.html';
	}
	foreach ( leadwerk_theme_pascal_source_map() as $source_key => $source_file ) {
		if ( $file === leadwerk_theme_pascal_normalize_relative_path( $source_file ) ) {
			return (string) $source_key;
		}
	}
	return '';
}

/**
 * Current Pascal source file.
 *
 * @param int $post_id Optional post ID.
 * @return string
 */
function leadwerk_theme_pascal_current_source_file( $post_id = 0 ) {
	$post_id    = $post_id ? (int) $post_id : (int) get_queried_object_id();
	$source_key = $post_id ? (string) get_post_meta( $post_id, 'leadwerk_source_key', true ) : '';
	if ( '' === $source_key && is_404() ) {
		$source_key = 'pascal-404-v1';
	}
	return leadwerk_theme_pascal_source_file( $source_key );
}

/**
 * Read one Pascal shell HTML file.
 *
 * @param string $source_key Source key.
 * @return string
 */
function leadwerk_theme_pascal_get_shell_html( $source_key ) {
	$file = leadwerk_theme_pascal_source_file( $source_key );
	if ( '' === $file && is_404() ) {
		$file = '404.html';
	}
	if ( '' === $file ) {
		return '';
	}

	$path = function_exists( 'leadwerk_theme_resolve_exact_shell_file' ) ? leadwerk_theme_resolve_exact_shell_file( $file ) : '';
	if ( '' === $path ) {
		$base = leadwerk_theme_get_static_source_base();
		$path = trailingslashit( $base['dir'] ) . $file;
	}
	if ( ! is_file( $path ) ) {
		return '';
	}

	$html = file_get_contents( $path );
	return false !== $html ? (string) $html : '';
}

/**
 * Render Pascal page content from Leadwerk fields.
 *
 * @param array<string,mixed> $group   Field group.
 * @param mixed               $value   Stored value.
 * @param int                 $post_id Post ID.
 * @return string
 */
function leadwerk_theme_render_pascal_page_group( $group, $value, $post_id = 0 ) {
	unset( $group );

	$post_id     = $post_id ? (int) $post_id : (int) get_queried_object_id();
	$source_key  = (string) get_post_meta( $post_id, 'leadwerk_source_key', true );
	$source_file = leadwerk_theme_pascal_current_source_file( $post_id );
	$sections    = is_array( $value ) ? array_values( $value ) : array();
	$output      = '';

	foreach ( $sections as $section ) {
		if ( ! is_array( $section ) ) {
			continue;
		}
		$html = (string) ( $section['html'] ?? '' );
		if ( '' === trim( $html ) ) {
			continue;
		}
		$html    = leadwerk_theme_pascal_apply_section_content_fields( $html, $section );
		$html    = leadwerk_theme_pascal_apply_section_media_fields( $html, $section );
		$html    = leadwerk_theme_pascal_normalize_markup_urls( $html, $source_file, false );
		if ( function_exists( 'leadwerk_theme_prepare_section_html' ) ) {
			$html = leadwerk_theme_prepare_section_html( $html );
		}
		$output .= $html . "\n";
	}

	if ( '' === trim( $output ) && is_404() ) {
		return leadwerk_theme_render_pascal_404_shell_content();
	}

	if ( leadwerk_theme_pascal_is_legal_layout_source_key( $source_key ) ) {
		$output = leadwerk_theme_render_pascal_legal_hero_block( $source_key ) . $output;
	}

	if ( preg_match( '/<main\b[^>]*class="[^"]*\blegal-(main|section)\b/i', $output ) ) {
		return $output;
	}

	return '<main id="main-content" class="pascal-roth-page">' . $output . '</main>';
}

/**
 * Pascal legal pages that use impressum/datenschutz shell styling.
 *
 * @param string $source_key Source key.
 * @return bool
 */
function leadwerk_theme_pascal_is_legal_layout_source_key( $source_key ) {
	return in_array(
		(string) $source_key,
		array(
			'pascal-impressum-v1',
			'pascal-datenschutz-v1',
			'pascal-legal-v1',
		),
		true
	);
}

/**
 * Pascal legal pages with a dark hero header block.
 *
 * @param string $source_key Source key.
 * @return bool
 */
function leadwerk_theme_pascal_has_legal_hero( $source_key ) {
	return in_array(
		(string) $source_key,
		array(
			'pascal-impressum-v1',
			'pascal-datenschutz-v1',
		),
		true
	);
}

/**
 * Render legal hero markup from the static shell (Impressum/Datenschutz).
 *
 * @param string $source_key Source key.
 * @return string
 */
function leadwerk_theme_render_pascal_legal_hero_block( $source_key ) {
	if ( ! leadwerk_theme_pascal_has_legal_hero( $source_key ) ) {
		return '';
	}

	$html = leadwerk_theme_pascal_get_shell_html( $source_key );
	if ( '' === trim( $html ) ) {
		return '';
	}

	list( $dom, $xpath ) = leadwerk_theme_pascal_dom_xpath( $html );
	$hero = leadwerk_theme_pascal_first_node( $xpath, '//header[contains(@class,"legal-hero")][1]' );
	if ( ! $hero instanceof DOMNode ) {
		return '';
	}

	$source_file = leadwerk_theme_pascal_source_file( $source_key );
	return leadwerk_theme_pascal_normalize_markup_urls( leadwerk_theme_pascal_outer_html( $hero ), $source_file, false );
}

/**
 * Render content for true WordPress 404 requests.
 *
 * @return string
 */
function leadwerk_theme_render_pascal_404_shell_content() {
	$html = leadwerk_theme_pascal_get_shell_html( 'pascal-404-v1' );
	if ( '' === trim( $html ) ) {
		return '<main class="pascal-roth-page"><section class="section"><div style="max-width:960px;margin:0 auto;padding:140px 20px 80px;"><h1>404</h1><p>Diese Seite wurde nicht gefunden.</p></div></section></main>';
	}

	list( $dom, $xpath ) = leadwerk_theme_pascal_dom_xpath( $html );
	$main = leadwerk_theme_pascal_first_node( $xpath, '//body/main[1]' );
	$out  = $main instanceof DOMNode ? leadwerk_theme_pascal_outer_html( $main ) : '';
	return leadwerk_theme_pascal_normalize_markup_urls( $out, '404.html', false );
}

/**
 * Apply structured Pascal section content fields to the stored HTML template.
 *
 * @param string              $html    Section HTML.
 * @param array<string,mixed> $section Section value.
 * @return string
 */
function leadwerk_theme_pascal_apply_section_content_fields( $html, $section ) {
	list( $dom, $xpath ) = leadwerk_theme_pascal_fragment_dom_xpath( $html );
	$root = leadwerk_theme_pascal_first_node( $xpath, '//*[@id="leadwerk-pascal-fragment"]' );
	if ( ! $root instanceof DOMElement ) {
		return $html;
	}

	$eyebrow = trim( (string) ( $section['eyebrow'] ?? '' ) );
	if ( '' !== $eyebrow ) {
		$node = leadwerk_theme_pascal_first_node(
			$xpath,
			'.//*[contains(@class,"overline") or contains(@class,"eyebrow") or contains(@class,"legal-eyebrow")][1]',
			$root
		);
		if ( $node instanceof DOMElement ) {
			leadwerk_theme_pascal_set_element_text( $node, $eyebrow );
		}
	}

	$heading = trim( (string) ( $section['heading'] ?? '' ) );
	if ( '' !== $heading ) {
		$node = leadwerk_theme_pascal_first_node( $xpath, './/h1[1]|.//h2[1]|.//h3[1]', $root );
		if ( $node instanceof DOMElement ) {
			leadwerk_theme_pascal_set_inner_html( $node, $heading );
		}
	}

	$subheading = trim( (string) ( $section['subheading'] ?? '' ) );
	if ( '' !== $subheading ) {
		$node = leadwerk_theme_pascal_first_node(
			$xpath,
			'.//*[contains(@class,"vma-hero__sub") or contains(@class,"__sub") or contains(@class,"legal-lead") or contains(@class,"faq-split__lead") or contains(@class,"__lead")][1]',
			$root
		);
		if ( $node instanceof DOMElement ) {
			leadwerk_theme_pascal_set_element_text( $node, $subheading );
		}
	}

	$intro = trim( (string) ( $section['intro'] ?? '' ) );
	if ( '' !== $intro ) {
		$node = leadwerk_theme_pascal_first_node(
			$xpath,
			'.//*[contains(@class,"bridge__text")][1]|.//article[contains(@class,"legal-content")][1]|.//*[contains(@class,"legal-section__body")][1]|.//*[contains(@class,"kontakt-form-intro")][1]',
			$root
		);
		if ( $node instanceof DOMElement ) {
			leadwerk_theme_pascal_set_inner_html( $node, $intro );
		}
	}

	$buttons = is_array( $section['buttons'] ?? null ) ? array_values( $section['buttons'] ) : array();
	if ( ! empty( $buttons ) ) {
		$button_nodes = $xpath->query( './/a[contains(@class,"btn") or contains(@class,"text-link")]', $root );
		if ( $button_nodes instanceof DOMNodeList ) {
			$index = 0;
			foreach ( $button_nodes as $button_node ) {
				if ( ! $button_node instanceof DOMElement || ! isset( $buttons[ $index ] ) || ! is_array( $buttons[ $index ] ) ) {
					++$index;
					continue;
				}
				$item = $buttons[ $index ];
				leadwerk_theme_pascal_bind_anchor(
					$button_node,
					(string) ( $item['cta_label'] ?? '' ),
					(string) ( $item['cta_page_key'] ?? '' ),
					(string) ( $item['cta_url'] ?? '' )
				);
				++$index;
			}
		}
	}

	$cards = is_array( $section['cards'] ?? null ) ? array_values( $section['cards'] ) : array();
	if ( ! empty( $cards ) ) {
		$card_nodes = $xpath->query( './/*[contains(@class,"bridge__card")]', $root );
		if ( ! $card_nodes instanceof DOMNodeList || 0 === $card_nodes->length ) {
			$card_nodes = $xpath->query( './/*[contains(@class,"testimonial-card")]', $root );
		}
		if ( $card_nodes instanceof DOMNodeList ) {
			$index = 0;
			foreach ( $card_nodes as $card_node ) {
				if ( ! $card_node instanceof DOMElement || ! isset( $cards[ $index ] ) || ! is_array( $cards[ $index ] ) ) {
					++$index;
					continue;
				}
				$item = $cards[ $index ];
				if ( false !== strpos( (string) $card_node->getAttribute( 'class' ), 'bridge__card' ) ) {
					$title = leadwerk_theme_pascal_first_node( $xpath, './/strong[1]', $card_node );
					if ( $title instanceof DOMElement && '' !== trim( (string) ( $item['title'] ?? '' ) ) ) {
						leadwerk_theme_pascal_set_element_text( $title, (string) $item['title'] );
					}
					$text = leadwerk_theme_pascal_first_node( $xpath, './/*[contains(@class,"bridge__card-copy")]//p[1]', $card_node );
					if ( $text instanceof DOMElement && '' !== trim( (string) ( $item['text'] ?? '' ) ) ) {
						leadwerk_theme_pascal_set_inner_html( $text, (string) $item['text'] );
					}
				} else {
					$stars = leadwerk_theme_pascal_first_node( $xpath, './/p[contains(@class,"testimonial-stars")][1]', $card_node );
					if ( $stars instanceof DOMElement ) {
						$star_text = trim( wp_strip_all_tags( $stars->textContent ) );
						if ( '' === $star_text || strlen( $star_text ) > 10 ) {
							leadwerk_theme_pascal_set_element_text( $stars, '★★★★★' );
						}
					}

					$quote = leadwerk_theme_pascal_first_node(
						$xpath,
						'.//p[contains(@style,"italic")][1]|.//p[contains(@class,"testimonial-text")][1]',
						$card_node
					);
					if ( $quote instanceof DOMElement && '' !== trim( (string) ( $item['text'] ?? '' ) ) ) {
						leadwerk_theme_pascal_set_inner_html( $quote, (string) $item['text'] );
					}
					$author = leadwerk_theme_pascal_first_node( $xpath, './/div/div/p[1]', $card_node );
					if ( $author instanceof DOMElement && '' !== trim( (string) ( $item['title'] ?? '' ) ) ) {
						leadwerk_theme_pascal_set_element_text( $author, (string) $item['title'] );
					}
					$source = leadwerk_theme_pascal_first_node( $xpath, './/div/div/p[2]', $card_node );
					if ( $source instanceof DOMElement && '' !== trim( (string) ( $item['eyebrow'] ?? '' ) ) ) {
						leadwerk_theme_pascal_set_element_text( $source, (string) $item['eyebrow'] );
					}
				}
				++$index;
			}
		}
	}

	$faq_items = is_array( $section['faq_items'] ?? null ) ? array_values( $section['faq_items'] ) : array();
	if ( ! empty( $faq_items ) ) {
		$faq_nodes = $xpath->query( './/*[contains(@class,"faq-item")]', $root );
		if ( $faq_nodes instanceof DOMNodeList ) {
			$index = 0;
			foreach ( $faq_nodes as $faq_node ) {
				if ( ! $faq_node instanceof DOMElement || ! isset( $faq_items[ $index ] ) || ! is_array( $faq_items[ $index ] ) ) {
					++$index;
					continue;
				}
				$item = $faq_items[ $index ];
				$question = leadwerk_theme_pascal_first_node( $xpath, './/*[contains(@class,"faq-trigger__label")][1]', $faq_node );
				if ( $question instanceof DOMElement && '' !== trim( (string) ( $item['question'] ?? '' ) ) ) {
					leadwerk_theme_pascal_set_element_text( $question, (string) $item['question'] );
				}
				$answer = leadwerk_theme_pascal_first_node( $xpath, './/*[contains(@class,"faq-answer")][1]', $faq_node );
				if ( $answer instanceof DOMElement && '' !== trim( (string) ( $item['answer'] ?? '' ) ) ) {
					leadwerk_theme_pascal_set_inner_html( $answer, (string) $item['answer'] );
				}
				++$index;
			}
		}
	}

	$trust_badges = is_array( $section['trust_badges'] ?? null ) ? array_values( $section['trust_badges'] ) : array();
	if ( ! empty( $trust_badges ) ) {
		$badge_nodes = $xpath->query( './/*[contains(@class,"trust-badge")]', $root );
		if ( $badge_nodes instanceof DOMNodeList ) {
			$index = 0;
			foreach ( $badge_nodes as $badge_node ) {
				if ( ! $badge_node instanceof DOMElement || ! isset( $trust_badges[ $index ] ) || ! is_array( $trust_badges[ $index ] ) ) {
					++$index;
					continue;
				}
				$text = trim( (string) ( $trust_badges[ $index ]['text'] ?? '' ) );
				if ( '' !== $text ) {
					leadwerk_theme_pascal_set_element_text_preserve_decorations( $badge_node, $text );
				}
				++$index;
			}
		}
	}

	return leadwerk_theme_pascal_inner_html( $root );
}

/**
 * Bind label and href on a Pascal anchor while keeping trailing icons.
 *
 * @param DOMElement $node     Anchor node.
 * @param string     $label    Link label.
 * @param string     $page_key Internal page key.
 * @param string     $url      External/relative URL fallback.
 * @return void
 */
function leadwerk_theme_pascal_bind_anchor( DOMElement $node, $label, $page_key = '', $url = '' ) {
	$label = trim( wp_strip_all_tags( (string) $label ) );
	$page_key = trim( (string) $page_key );
	$url = trim( (string) $url );

	if ( function_exists( 'leadwerk_theme_resolve_exact_href' ) ) {
		$href = leadwerk_theme_resolve_exact_href( $page_key, $url );
	} elseif ( '' !== $page_key && function_exists( 'leadwerk_theme_get_page_url' ) ) {
		$href = leadwerk_theme_get_page_url( $page_key, leadwerk_theme_get_current_lang(), '' !== $url ? $url : '#' );
	} else {
		$href = '' !== $url ? $url : '#';
	}

	if ( '' !== $href && '#' !== $href ) {
		$node->setAttribute( 'href', $href );
	}

	if ( '' === $label ) {
		return;
	}

	leadwerk_theme_pascal_set_element_text_preserve_decorations( $node, $label );
}

/**
 * Replace element text content while keeping svg/span icon children.
 *
 * @param DOMElement $node Element.
 * @param string     $text Plain text.
 * @return void
 */
function leadwerk_theme_pascal_set_element_text_preserve_decorations( DOMElement $node, $text ) {
	$text = trim( wp_strip_all_tags( (string) $text ) );

	foreach ( iterator_to_array( $node->childNodes, false ) as $child ) {
		if ( $child instanceof DOMText && $child->parentNode === $node ) {
			$node->removeChild( $child );
		}
	}

	if ( '' === $text ) {
		return;
	}

	$doc = $node->ownerDocument;
	if ( ! $doc ) {
		return;
	}

	$first_child = $node->firstChild;
	if ( $first_child instanceof DOMElement && in_array( strtolower( $first_child->tagName ), array( 'svg', 'span' ), true ) ) {
		$node->appendChild( $doc->createTextNode( ' ' . $text ) );
		return;
	}

	$first_trailing = null;
	foreach ( iterator_to_array( $node->childNodes, false ) as $child ) {
		if ( $child instanceof DOMElement && in_array( strtolower( $child->tagName ), array( 'svg', 'span' ), true ) ) {
			$first_trailing = $child;
			break;
		}
	}

	if ( $first_trailing ) {
		$node->insertBefore( $doc->createTextNode( $text . ' ' ), $first_trailing );
		return;
	}

	$node->appendChild( $doc->createTextNode( $text ) );
}

/**
 * Replace all text in an element.
 *
 * @param DOMElement $node Element.
 * @param string     $text Plain text.
 * @return void
 */
function leadwerk_theme_pascal_set_element_text( DOMElement $node, $text ) {
	while ( $node->firstChild ) {
		$node->removeChild( $node->firstChild );
	}
	$text = trim( wp_strip_all_tags( (string) $text ) );
	if ( '' !== $text ) {
		$node->appendChild( $node->ownerDocument->createTextNode( $text ) );
	}
}

/**
 * Replace inner HTML of an element from an HTML fragment.
 *
 * @param DOMElement $node Element.
 * @param string     $html HTML fragment.
 * @return void
 */
function leadwerk_theme_pascal_set_inner_html( DOMElement $node, $html ) {
	$html = trim( (string) $html );
	while ( $node->firstChild ) {
		$node->removeChild( $node->firstChild );
	}
	if ( '' === $html ) {
		return;
	}

	$doc = $node->ownerDocument;
	if ( ! $doc ) {
		return;
	}

	$previous = libxml_use_internal_errors( true );
	$tmp = new DOMDocument( '1.0', 'UTF-8' );
	$tmp->loadHTML( '<?xml encoding="utf-8" ?><div id="leadwerk-pascal-inner">' . $html . '</div>' );
	libxml_clear_errors();
	libxml_use_internal_errors( $previous );

	$source = $tmp->getElementById( 'leadwerk-pascal-inner' );
	if ( ! $source ) {
		$node->appendChild( $doc->createTextNode( wp_strip_all_tags( $html ) ) );
		return;
	}

	foreach ( iterator_to_array( $source->childNodes, false ) as $child ) {
		$node->appendChild( $doc->importNode( $child, true ) );
	}
}

/**
 * Apply explicit image/background fields to section HTML.
 *
 * @param string              $html    Section HTML.
 * @param array<string,mixed> $section Section value.
 * @return string
 */
function leadwerk_theme_pascal_apply_section_media_fields( $html, $section ) {
	list( $dom, $xpath ) = leadwerk_theme_pascal_fragment_dom_xpath( $html );
	$root = leadwerk_theme_pascal_first_node( $xpath, '//*[@id="leadwerk-pascal-fragment"]' );
	if ( ! $root instanceof DOMElement ) {
		return $html;
	}

	$images = is_array( $section['images'] ?? null ) ? array_values( $section['images'] ) : array();
	$img_nodes = $xpath->query( './/img', $root );
	if ( $img_nodes instanceof DOMNodeList ) {
		$index = 0;
		foreach ( $img_nodes as $img_node ) {
			if ( ! $img_node instanceof DOMElement ) {
				continue;
			}
			$item = isset( $images[ $index ] ) && is_array( $images[ $index ] ) ? $images[ $index ] : array();
			$attachment_id = absint( $item['image'] ?? 0 );
			if ( $attachment_id ) {
				$url = wp_get_attachment_url( $attachment_id );
				if ( $url ) {
					$img_node->setAttribute( 'src', $url );
					$img_node->removeAttribute( 'srcset' );
				}
			}
			if ( isset( $item['alt'] ) && '' !== trim( (string) $item['alt'] ) ) {
				$img_node->setAttribute( 'alt', (string) $item['alt'] );
			}
			++$index;
		}
	}

	$background_id = absint( $section['background_image'] ?? 0 );
	if ( $background_id ) {
		$root_classes = ' ' . trim( (string) $root->getAttribute( 'class' ) ) . ' ';
		$is_vma_hero  = false !== strpos( $root_classes, ' vma-hero ' );

		// Hero backgrounds come from page.css (::before). Inline overrides break parallax/fade.
		if ( ! $is_vma_hero ) {
			$url = wp_get_attachment_url( $background_id );
			$target = $root;
			if ( $url && $target instanceof DOMElement ) {
				$classes = preg_split( '/\s+/', trim( (string) $target->getAttribute( 'class' ) ) );
				$classes = array_values( array_filter( (array) $classes ) );
				if ( ! in_array( 'pascal-bg-field', $classes, true ) ) {
					$classes[] = 'pascal-bg-field';
				}
				$target->setAttribute( 'class', implode( ' ', $classes ) );
				$style = trim( (string) $target->getAttribute( 'style' ) );
				$style = '' !== $style ? rtrim( $style, ';' ) . ';' : '';
				$target->setAttribute( 'style', $style . '--leadwerk-bg-image:url("' . esc_url_raw( $url ) . '");background-image:url("' . esc_url_raw( $url ) . '");' );
			}
		}
	}

	return leadwerk_theme_pascal_inner_html( $root );
}

/**
 * Find the site-wide footer in a Pascal shell (skip component footers like fam-check__foot).
 *
 * @param DOMXPath $xpath XPath for shell document.
 * @return DOMNode|null
 */
function leadwerk_theme_pascal_find_site_footer( DOMXPath $xpath ) {
	$queries = array(
		'//footer[contains(concat(" ", normalize-space(@class), " "), " site-footer ")][1]',
		'//footer[.//*[contains(@class,"site-logo--footer")]][1]',
		'//footer[.//*[contains(@class,"site-footer__seo")]][1]',
		'//footer[not(contains(@class,"fam-check__foot"))][last()]',
	);

	foreach ( $queries as $query ) {
		$footer = leadwerk_theme_pascal_first_node( $xpath, $query );
		if ( $footer instanceof DOMNode ) {
			return $footer;
		}
	}

	return leadwerk_theme_pascal_first_node( $xpath, '//footer[last()]' );
}

/**
 * Render Pascal header.
 *
 * @return string
 */
function leadwerk_theme_render_pascal_header_block() {
	$source_key = function_exists( 'leadwerk_theme_get_current_source_key' ) ? leadwerk_theme_get_current_source_key() : '';
	if ( ! leadwerk_theme_is_pascal_source_key( $source_key ) ) {
		$source_key = 'pascal-home-v1';
	}

	$html = leadwerk_theme_pascal_extract_chrome_html( $source_key, 'header' );
	if ( '' === trim( $html ) && 'pascal-home-v1' !== $source_key ) {
		$html = leadwerk_theme_pascal_extract_chrome_html( 'pascal-home-v1', 'header' );
	}

	return $html;
}

/**
 * Render Pascal footer.
 *
 * @return string
 */
function leadwerk_theme_render_pascal_footer_block() {
	$source_key = function_exists( 'leadwerk_theme_get_current_source_key' ) ? leadwerk_theme_get_current_source_key() : '';
	if ( ! leadwerk_theme_is_pascal_source_key( $source_key ) ) {
		$source_key = 'pascal-home-v1';
	}

	$html = leadwerk_theme_pascal_extract_chrome_html( $source_key, 'footer' );
	if ( '' === trim( $html ) && 'pascal-home-v1' !== $source_key ) {
		$html = leadwerk_theme_pascal_extract_chrome_html( 'pascal-home-v1', 'footer' );
	}

	return $html;
}

/**
 * Extract header or footer from a shell.
 *
 * @param string $source_key Source key.
 * @param string $part       header|footer.
 * @return string
 */
function leadwerk_theme_pascal_extract_chrome_html( $source_key, $part ) {
	$html = leadwerk_theme_pascal_get_shell_html( $source_key );
	if ( '' === trim( $html ) ) {
		return '';
	}

	$source_file = leadwerk_theme_pascal_source_file( $source_key );
	list( $dom, $xpath ) = leadwerk_theme_pascal_dom_xpath( $html );
	$out = '';

	if ( 'header' === $part ) {
		$nav = leadwerk_theme_pascal_first_node( $xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " nav-wrapper ")][1]' );
		if ( $nav instanceof DOMNode ) {
			$out .= leadwerk_theme_pascal_outer_html( $nav );
		}
		$mobile = leadwerk_theme_pascal_first_node( $xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " mobile-menu ")][1]' );
		if ( $mobile instanceof DOMNode ) {
			$out .= leadwerk_theme_pascal_outer_html( $mobile );
		}
	} else {
		$footer = leadwerk_theme_pascal_find_site_footer( $xpath );
		if ( $footer instanceof DOMNode ) {
			$out .= leadwerk_theme_pascal_outer_html( $footer );
		}
	}

	$out = leadwerk_theme_pascal_normalize_markup_urls( $out, $source_file, true );
	if ( 'header' === $part ) {
		$out = leadwerk_theme_pascal_hydrate_nav_logo_data_attrs( $out );
	}

	return $out;
}

/**
 * Inject resolved WordPress logo URLs for nav scroll swapping (script.js).
 *
 * @param string $html Header chrome HTML.
 * @return string
 */
function leadwerk_theme_pascal_hydrate_nav_logo_data_attrs( $html ) {
	if ( '' === trim( (string) $html ) || ! class_exists( 'DOMDocument' ) ) {
		return (string) $html;
	}

	list( $dom, $xpath ) = leadwerk_theme_pascal_fragment_dom_xpath( (string) $html );
	$root = leadwerk_theme_pascal_first_node( $xpath, '//*[@id="leadwerk-pascal-fragment"]' );
	if ( ! $root instanceof DOMElement ) {
		return (string) $html;
	}

	$img = leadwerk_theme_pascal_first_node( $xpath, './/img[contains(@class,"site-logo--nav")]', $root );
	if ( ! $img instanceof DOMElement ) {
		return leadwerk_theme_pascal_inner_html( $root );
	}

	$logo_map = array(
		'data-logo-blue'  => 'Fotos/Pascal Roth Logo_blau.webp',
		'data-logo-dark'  => 'Fotos/Pascal Roth Logo.webp',
		'data-logo-white' => 'Fotos/Pascal_Roth_Logo_weiss.webp',
	);

	foreach ( $logo_map as $attr => $source_path ) {
		$url = leadwerk_theme_pascal_attachment_url_for_source( $source_path );
		if ( '' !== $url ) {
			$img->setAttribute( $attr, $url );
		}
	}

	return leadwerk_theme_pascal_inner_html( $root );
}

/**
 * Body class from source HTML.
 *
 * @param string $source_key Source key.
 * @return string
 */
function leadwerk_theme_pascal_body_class( $source_key ) {
	$html = leadwerk_theme_pascal_get_shell_html( $source_key );
	if ( '' === trim( $html ) ) {
		return '';
	}
	list( $dom, $xpath ) = leadwerk_theme_pascal_dom_xpath( $html );
	unset( $dom );
	$body = leadwerk_theme_pascal_first_node( $xpath, '//body[1]' );
	return $body instanceof DOMElement && $body->hasAttribute( 'class' ) ? (string) $body->getAttribute( 'class' ) : '';
}

/**
 * Normalize href/src/style URLs in a markup fragment.
 *
 * @param string $html         HTML.
 * @param string $context_file Source file.
 * @param bool   $chrome       Header/footer context.
 * @return string
 */
function leadwerk_theme_pascal_normalize_markup_urls( $html, $context_file = '', $chrome = false ) {
	if ( '' === trim( (string) $html ) || ! class_exists( 'DOMDocument' ) ) {
		return (string) $html;
	}

	list( $dom, $xpath ) = leadwerk_theme_pascal_fragment_dom_xpath( (string) $html );
	$root = leadwerk_theme_pascal_first_node( $xpath, '//*[@id="leadwerk-pascal-fragment"]' );
	if ( ! $root instanceof DOMElement ) {
		return (string) $html;
	}

	$nodes = $xpath->query( './/*', $root );
	if ( $nodes instanceof DOMNodeList ) {
		foreach ( $nodes as $node ) {
			if ( ! $node instanceof DOMElement ) {
				continue;
			}
			if ( $node->hasAttribute( 'href' ) ) {
				$node->setAttribute( 'href', leadwerk_theme_pascal_map_href_to_url( (string) $node->getAttribute( 'href' ), $context_file, $chrome ) );
			}
			foreach ( array( 'src', 'poster' ) as $attr ) {
				if ( $node->hasAttribute( $attr ) ) {
					$node->setAttribute( $attr, leadwerk_theme_pascal_map_asset_to_url( (string) $node->getAttribute( $attr ), $context_file ) );
				}
			}
			if ( $node->hasAttribute( 'srcset' ) ) {
				$node->setAttribute( 'srcset', leadwerk_theme_pascal_map_srcset_to_url( (string) $node->getAttribute( 'srcset' ), $context_file ) );
			}
			if ( $node->hasAttribute( 'style' ) ) {
				$node->setAttribute( 'style', leadwerk_theme_pascal_map_style_urls( (string) $node->getAttribute( 'style' ), $context_file ) );
			}
		}
	}

	return leadwerk_theme_pascal_inner_html( $root );
}

/**
 * Map href to a WordPress URL when it points at an imported HTML page.
 *
 * @param string $href         Raw href.
 * @param string $context_file Source file.
 * @param bool   $chrome       Header/footer context.
 * @return string
 */
function leadwerk_theme_pascal_map_href_to_url( $href, $context_file = '', $chrome = false ) {
	$href = trim( html_entity_decode( (string) $href, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	if ( '' === $href ) {
		return '';
	}
	if ( preg_match( '#^(?:https?:)?//#i', $href ) || preg_match( '#^(?:mailto:|tel:|javascript:)#i', $href ) ) {
		return $href;
	}

	if ( '#' === substr( $href, 0, 1 ) ) {
		if ( ! $chrome ) {
			return $href;
		}
		$home = leadwerk_theme_get_page_url( 'pascal-home-v1', leadwerk_theme_get_current_lang(), home_url( '/' ) );
		return $home . $href;
	}

	$fragment = '';
	$file     = $href;
	if ( false !== strpos( $file, '#' ) ) {
		$fragment = substr( $file, strpos( $file, '#' ) );
		$file     = substr( $file, 0, strpos( $file, '#' ) );
	}

	$file       = leadwerk_theme_pascal_resolve_relative_path( $file, $context_file );
	$source_key = leadwerk_theme_pascal_source_key_for_file( $file );
	if ( '' === $source_key && '' !== $file && '/' === substr( $file, -1 ) ) {
		$source_key = leadwerk_theme_pascal_source_key_for_file( $file . 'index.html' );
	}
	if ( '' !== $source_key ) {
		return leadwerk_theme_get_page_url( $source_key, leadwerk_theme_get_current_lang(), home_url( '/' . $file ) ) . $fragment;
	}

	return $href;
}

/**
 * Map a static asset URL to an imported attachment URL when possible.
 *
 * @param string $raw          Raw URL.
 * @param string $context_file Source file.
 * @return string
 */
function leadwerk_theme_pascal_map_asset_to_url( $raw, $context_file = '' ) {
	$raw = trim( html_entity_decode( (string) $raw, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	if ( '' === $raw || preg_match( '#^(?:https?:)?//#i', $raw ) || preg_match( '#^(?:data:|mailto:|tel:|javascript:|#)#i', $raw ) ) {
		return $raw;
	}

	$source_path = leadwerk_theme_pascal_resolve_relative_path( preg_replace( '/[?#].*$/', '', $raw ), $context_file );
	$attachment  = leadwerk_theme_pascal_attachment_url_for_source( $source_path );
	if ( '' !== $attachment ) {
		return $attachment;
	}

	return leadwerk_theme_static_asset_url( $source_path );
}

/**
 * Map srcset entries.
 *
 * @param string $srcset       Srcset.
 * @param string $context_file Source file.
 * @return string
 */
function leadwerk_theme_pascal_map_srcset_to_url( $srcset, $context_file = '' ) {
	$parts = array();
	foreach ( explode( ',', (string) $srcset ) as $candidate ) {
		$candidate = trim( $candidate );
		if ( '' === $candidate ) {
			continue;
		}
		$bits = preg_split( '/\s+/', $candidate );
		$url  = array_shift( $bits );
		$parts[] = trim( leadwerk_theme_pascal_map_asset_to_url( (string) $url, $context_file ) . ( ! empty( $bits ) ? ' ' . implode( ' ', $bits ) : '' ) );
	}
	return implode( ', ', $parts );
}

/**
 * Map url(...) references inside inline styles.
 *
 * @param string $style        Style.
 * @param string $context_file Source file.
 * @return string
 */
function leadwerk_theme_pascal_map_style_urls( $style, $context_file = '' ) {
	return (string) preg_replace_callback(
		'/url\\((["\']?)([^"\')]+)\\1\\)/i',
		static function ( $matches ) use ( $context_file ) {
			return 'url("' . esc_url_raw( leadwerk_theme_pascal_map_asset_to_url( (string) $matches[2], $context_file ) ) . '")';
		},
		(string) $style
	);
}

/**
 * Attachment URL by Leadwerk source path.
 *
 * @param string $source_path Source path.
 * @return string
 */
function leadwerk_theme_pascal_attachment_url_for_source( $source_path ) {
	$source_path = leadwerk_theme_pascal_normalize_relative_path( $source_path );
	if ( '' === $source_path ) {
		return '';
	}

	foreach ( leadwerk_theme_pascal_source_path_candidates( $source_path ) as $candidate ) {
		$q = new WP_Query(
			array(
				'post_type'              => 'attachment',
				'post_status'            => 'any',
				'fields'                 => 'ids',
				'posts_per_page'         => 1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					array(
						'key'   => 'leadwerk_source_path',
						'value' => $candidate,
					),
				),
			)
		);
		$ids = $q->get_posts();
		if ( empty( $ids[0] ) ) {
			continue;
		}

		$url = wp_get_attachment_url( (int) $ids[0] );
		if ( $url ) {
			return (string) $url;
		}
	}

	return '';
}

/**
 * Alternate source paths (webp/png, spaces preserved for Leadwerk meta).
 *
 * @param string $source_path Source path.
 * @return string[]
 */
function leadwerk_theme_pascal_source_path_candidates( $source_path ) {
	$candidates = array( $source_path );
	$ext        = strtolower( pathinfo( $source_path, PATHINFO_EXTENSION ) );

	if ( in_array( $ext, array( 'png', 'jpg', 'jpeg' ), true ) ) {
		$candidates[] = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $source_path );
	} elseif ( 'webp' === $ext ) {
		$candidates[] = preg_replace( '/\.webp$/i', '.png', $source_path );
	}

	return array_values( array_unique( array_filter( $candidates ) ) );
}

/**
 * Resolve a path relative to the source file.
 *
 * @param string $path         Path.
 * @param string $context_file Context file.
 * @return string
 */
function leadwerk_theme_pascal_resolve_relative_path( $path, $context_file = '' ) {
	$path = trim( rawurldecode( str_replace( '\\', '/', (string) $path ) ) );
	if ( '' === $path ) {
		return '';
	}
	if ( '/' === substr( $path, 0, 1 ) ) {
		return leadwerk_theme_pascal_normalize_relative_path( $path );
	}

	$context_file = str_replace( '\\', '/', (string) $context_file );
	$base_dir     = trim( dirname( $context_file ), './' );
	$combined     = ( '' !== $base_dir && '.' !== $base_dir )
		? $base_dir . '/' . $path
		: $path;

	return leadwerk_theme_pascal_normalize_relative_path( $combined );
}

/**
 * Normalize dot segments.
 *
 * @param string $path Path.
 * @return string
 */
function leadwerk_theme_pascal_normalize_relative_path( $path ) {
	$parts = array();
	foreach ( explode( '/', str_replace( '\\', '/', (string) $path ) ) as $part ) {
		if ( '' === $part || '.' === $part ) {
			continue;
		}
		if ( '..' === $part ) {
			array_pop( $parts );
			continue;
		}
		$parts[] = $part;
	}
	return implode( '/', $parts );
}

/**
 * DOMDocument + XPath for a full document.
 *
 * @param string $html HTML.
 * @return array{0:DOMDocument,1:DOMXPath}
 */
function leadwerk_theme_pascal_dom_xpath( $html ) {
	$dom = new DOMDocument( '1.0', 'UTF-8' );
	libxml_use_internal_errors( true );
	$dom->loadHTML( '<?xml encoding="utf-8" ?>' . (string) $html );
	libxml_clear_errors();
	return array( $dom, new DOMXPath( $dom ) );
}

/**
 * DOMDocument + XPath for an HTML fragment.
 *
 * @param string $html HTML.
 * @return array{0:DOMDocument,1:DOMXPath}
 */
function leadwerk_theme_pascal_fragment_dom_xpath( $html ) {
	return leadwerk_theme_pascal_dom_xpath( '<div id="leadwerk-pascal-fragment">' . (string) $html . '</div>' );
}

/**
 * First XPath node.
 *
 * @param DOMXPath|DOMNode $context Context.
 * @param string           $query   Query.
 * @param DOMNode|null     $node    Optional context node.
 * @return DOMNode|null
 */
function leadwerk_theme_pascal_first_node( $context, $query, $node = null ) {
	if ( $context instanceof DOMXPath ) {
		$list = $node instanceof DOMNode ? $context->query( $query, $node ) : $context->query( $query );
	} elseif ( $context instanceof DOMNode ) {
		$list = ( new DOMXPath( $context->ownerDocument ) )->query( $query, $context );
	} else {
		return null;
	}
	return $list instanceof DOMNodeList && $list->length > 0 ? $list->item( 0 ) : null;
}

/**
 * Outer HTML.
 *
 * @param DOMNode $node Node.
 * @return string
 */
function leadwerk_theme_pascal_outer_html( $node ) {
	return $node instanceof DOMNode && $node->ownerDocument ? (string) $node->ownerDocument->saveHTML( $node ) : '';
}

/**
 * Inner HTML.
 *
 * @param DOMNode $node Node.
 * @return string
 */
function leadwerk_theme_pascal_inner_html( $node ) {
	if ( ! $node instanceof DOMNode || ! $node->ownerDocument ) {
		return '';
	}

	$html = '';
	foreach ( $node->childNodes as $child ) {
		$html .= $node->ownerDocument->saveHTML( $child );
	}
	return $html;
}
