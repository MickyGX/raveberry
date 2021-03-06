$(document).ready(function() {
	$(function() {
		$(".autocomplete").autocomplete({
			source: function(request, response) {
				$.get(urls['suggestions'], {
					'term': request.term,
					'playlist': playlistEnabled(),
				}).done(function(suggestions) {

					let search_entry = {
						'value': request.term,
						'type': 'search',
					};

					suggestions.unshift(search_entry);
					response(suggestions);
				})
			},
			appendTo: '#music_input_card',
			open: function() {
				// align the autocomplete box with the card instead of the input field
				let card_position = $("#music_input_card").position();
				let input_position = $("#music_input").position();

				$("#music_input_card > ul").css({left: '0px',
					top: (input_position.bottom - card_position.bottom) + "px" });

			},
			select: function(event, ui) {
				let origEvent = event;
				while (origEvent.originalEvent !== undefined){
					origEvent = origEvent.originalEvent;
				}

				let elem = $(origEvent.target);
				if (elem.hasClass('autocomplete_info') || elem.parents('.autocomplete_info').length > 0) {
					// the info or insert button was clicked, insert the text (default behavior)
					return true;
				}

				// the text was clicked, push the song and clear the input box
				if (ui.item.type == 'search') {
					request_new_music(ui.item.label);
				} else if (ui.item.type == 'youtube-online') {
					request_new_music(ui.item.label, 'youtube');
				} else if (ui.item.type == 'spotify-online') {
					request_new_music(ui.item.key, 'spotify');
				} else {
					request_archived_music(ui.item.key, ui.item.label);
				}
				return false;
			},
			focus: function (event, ui) {
				return false;
			}
		})
			.data("ui-autocomplete")._renderItem = function (ul, item) {
				if (item.type == 'search') {
					let suggestion_div = $('<div>')
						.text(item.label)
						.prepend('<i class="fas fa-search suggestion_type"></i>');
					return $('<li class="ui-menu-item-with-icon"></li>')
						.data("item.autocomplete", item)
						.append(suggestion_div)
						.appendTo(ul);
				}

				let icon = $('<i>')
					.addClass('suggestion_type')
					.addClass(item.type);
				if (item.type.startsWith('local')) {
					icon.addClass('fas')
						.addClass('fa-hdd');
				} else if (item.type.startsWith('youtube')) {
					icon.addClass('fab')
					    .addClass('fa-youtube');
				} else if (item.type.startsWith('spotify')) {
					icon.addClass('fab')
					    .addClass('fa-spotify');
				}

				let counter = '(' + item.counter + ')';
				if (item.type.endsWith('online')) {
					counter = '';
				}

				let suggestion_div = $('<div>')
					.text(item.label)
					.prepend(icon);

				// modify the suggestions to contain an icon
				return $('<li class="ui-menu-item-with-icon"></li>')
					.data("item.autocomplete", item)
					.append(suggestion_div)
					.append('<div class="autocomplete_info">' + counter + '<i class="fas fa-reply insert_icon"></i>')
					.appendTo(ul);
			};
	});

	// set the autocomplete box's width to that of the card
	jQuery.ui.autocomplete.prototype._resizeMenu = function () {
		let ul = this.menu.element;
		ul.outerWidth(this.element.outerWidth());
		ul.outerWidth($('#current_song_card').outerWidth());
		ul.css('left', $('#current_song_card').position()['left']);
	}
});
