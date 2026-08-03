masonry();
$(function () {
    offCanvas();
    lightbox();
    carousels();
    utils();
    highlightCurrentPage();
    makeImagesResponsive();
    spoolTypeFilter();
});
function highlightCurrentPage() {
  $("a[href='" + location.href + "']").parent().addClass("active");
}
function makeImagesResponsive() {
    $("img").addClass("img-responsive");
}
/* =========================================
 *  carousels
 *  =======================================*/
function carousels() {
    $('#main-slider').owlCarousel({
	navigation: true, // Show next and prev buttons
	slideSpeed: 300,
	paginationSpeed: 400,
	autoPlay: true,
	stopOnHover: true,
	singleItem: true,
	afterInit: ''
    });
}
/* =========================================
 *  masonry
 *  =======================================*/
function masonry() {
    var $grid = $('.grid').masonry({
        itemSelector: ".masonry-item"
    });
    $grid.imagesLoaded().progress(function () {
        $grid.masonry('layout');
    });
}
/* =========================================
 *  Off-canvas menu
 *  =======================================*/
function offCanvas() {
    $(document).ready(function () {
        $('[data-toggle="offcanvas"]').click(function () {
            $('.row-offcanvas').toggleClass('active')
        });
    });
}
/* =========================================
 *  lightbox
 *  =======================================*/
function lightbox() {
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
}
/* =========================================
 *  utils
 *  =======================================*/
function utils() {
    /* tooltips */
    $('[data-toggle="tooltip"]').tooltip();
    /* click on the box activates the radio */
    $('#checkout').on('click', '.box.shipping-method, .box.payment-method', function (e) {
        var radio = $(this).find(':radio');
        radio.prop('checked', true);
    });
    /* click on the box activates the link in it */
    $('.box.clickable').on('click', function (e) {
        window.location = $(this).find('a').attr('href');
    });
    /* external links in new window*/
    $('.external').on('click', function (e) {
        e.preventDefault();
        window.open($(this).attr("href"));
    });
    /* animated scrolling */
    $('.scroll-to').click(function (event) {
        event.preventDefault();
        var full_url = this.href;
        var parts = full_url.split("#");
        var trgt = parts[1];
        $('body').scrollTo($('#' + trgt), 800, {offset: -80});
    });
}
/* =========================================
 *  spool type filter
 *  =======================================*/
function spoolTypeFilter() {
    var $container = $('#spool-type-filter-container');
    if ($container.length === 0) {
        return;
    }
    // Cache jQuery selectors
    var $items = $('[data-spool-type]');
    var $spoolOptions = $container.find('[data-spool-type-option]');
    var $brandDropdown = $container.find('[data-filter-control="brand"]');
    var $filamentTypeDropdown = $container.find('[data-filter-control="filament_type"]');
    var $brandFilter = $brandDropdown.find('.spool-filter-dropdown-input');
    var $filamentTypeFilter = $filamentTypeDropdown.find('.spool-filter-dropdown-input');
    var currentFilterKey = '';

    // Utility function to normalize strings for comparison
    function normalize(value) {
        return (value || '').trim().toLowerCase();
    }

    // Function to close a dropdown
    function closeDropdown($dropdown) {
        $dropdown.removeClass('is-open');
    }

    // Function to close all dropdowns
    function closeAllDropdowns() {
        $brandDropdown.removeClass('is-open');
        $filamentTypeDropdown.removeClass('is-open');
    }

    // Update dropdown options based on the entered text in the input field
    function updateDropdownOptions($dropdown, query) {
        var normalizedQuery = normalize(query);
        var $options = $dropdown.find('.spool-filter-dropdown-option');
        var visibleCount = 0;

        $options.each(function () {
            var $option = $(this);
            var matches = !normalizedQuery || normalize($option.attr('data-value')).indexOf(normalizedQuery) !== -1;
            $option.toggle(matches);
            if (matches) {
                visibleCount += 1;
            }
        });

        $dropdown.toggleClass('has-results', visibleCount > 0);
    }

    // Function to open a dropdown and close others
    function openDropdown($dropdown) {
        closeAllDropdowns();
        $dropdown.addClass('is-open');
    }

    // Bind a dropdown to its input and handle changes
    function bindDropdown($dropdown, $input, onChange) {
        var $options = $dropdown.find('.spool-filter-dropdown-option');

        $input.on('focus click input', function () {
            updateDropdownOptions($dropdown, $input.val());
            openDropdown($dropdown);
        });

        $input.on('keydown', function (event) {
            if (event.key === 'Escape') {
                closeDropdown($dropdown);
            }
        });

        $options.on('click', function () {
            var value = $(this).attr('data-value') || '';
            $input.val(value);
            closeDropdown($dropdown);
            onChange();
        });
    }

    // Get the current filter state from the URL parameters
    function readFilterStateFromUrl() {
        var url = new URL(window.location);
        return {
            spool_type: url.searchParams.get('spool_type') || '',
            brand: url.searchParams.get('brand') || '',
            filament_type: url.searchParams.get('filament_type') || ''
        };
    }

    // Get the current spool type filter from the controls 
    function readFilterStateFromControls() {
        return {
            spool_type: $spoolOptions.filter('.active').attr('data-spool-type-option') || '',
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        };
    }

    // Set the active spool type based on the filter value
    function setActiveSpoolType(filterValue) {
        $spoolOptions.closest('li').removeClass('active');
        $spoolOptions.filter('[data-spool-type-option="' + filterValue + '"]').parent().addClass('active');
    }

    // Apply the filter state to the UI and update the URL if needed
    function applyFilterState(filterState, updateUrl) {
        var normalizedState = {
            spool_type: normalize(filterState.spool_type),
            brand: normalize(filterState.brand),
            filament_type: normalize(filterState.filament_type)
        };
        var filterKey = [normalizedState.spool_type, normalizedState.brand, normalizedState.filament_type].join('|');

        if (filterKey === currentFilterKey) {
            if (updateUrl) {
                var currentUrl = new URL(window.location);
                if (filterState.spool_type) {
                    currentUrl.searchParams.set('spool_type', filterState.spool_type);
                } else {
                    currentUrl.searchParams.delete('spool_type');
                }
                if (filterState.brand) {
                    currentUrl.searchParams.set('brand', filterState.brand);
                } else {
                    currentUrl.searchParams.delete('brand');
                }
                if (filterState.filament_type) {
                    currentUrl.searchParams.set('filament_type', filterState.filament_type);
                } else {
                    currentUrl.searchParams.delete('filament_type');
                }
                window.history.pushState({}, '', currentUrl);
            }
            return;
        }

        currentFilterKey = filterKey;
        $brandFilter.val(filterState.brand);
        $filamentTypeFilter.val(filterState.filament_type);
        updateDropdownOptions($brandDropdown, filterState.brand);
        updateDropdownOptions($filamentTypeDropdown, filterState.filament_type);
        setActiveSpoolType(normalizedState.spool_type);

        // Show/hide items based on the filter state
        // Hide all items first, then show only those that match the filter criteria
        $items.hide().removeClass('masonry-item');
        $items.filter(function () {
            var $item = $(this);
            var itemSpoolType = normalize($item.attr('data-spool-type'));
            var itemBrand = normalize($item.attr('data-brand'));
            var itemFilamentType = normalize($item.attr('data-filament-type'));

            return (!normalizedState.spool_type || itemSpoolType === normalizedState.spool_type) &&
                (!normalizedState.brand || itemBrand === normalizedState.brand) &&
                (!normalizedState.filament_type || itemFilamentType === normalizedState.filament_type);
        }).show().addClass('masonry-item');

        // Refresh the Masonry layout after filtering
        $('.grid').masonry('reloadItems').masonry('layout');

        // Update the URL parameters to reflect the current filter state
        if (updateUrl) {
            var url = new URL(window.location);
            if (filterState.spool_type) {
                url.searchParams.set('spool_type', filterState.spool_type);
            } else {
                url.searchParams.delete('spool_type');
            }
            if (filterState.brand) {
                url.searchParams.set('brand', filterState.brand);
            } else {
                url.searchParams.delete('brand');
            }
            if (filterState.filament_type) {
                url.searchParams.set('filament_type', filterState.filament_type);
            } else {
                url.searchParams.delete('filament_type');
            }
            window.history.pushState({}, '', url);
        }
    }

    // Update the filter state based on the URL parameters
    function updateFilterFromUrl() {
        applyFilterState(readFilterStateFromUrl(), false);
    }

    // Bind the brand and filament type dropdowns to their respective input fields and handle changes
    bindDropdown($brandDropdown, $brandFilter, function () {
        applyFilterState({
            spool_type: readFilterStateFromControls().spool_type,
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        }, true);
    });

    bindDropdown($filamentTypeDropdown, $filamentTypeFilter, function () {
        applyFilterState({
            spool_type: readFilterStateFromControls().spool_type,
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        }, true);
    });

    // Update spool type filter on options click
    $spoolOptions.closest('a').click(function (e) {
        e.preventDefault();
        closeAllDropdowns();
        var selectedType = $(this).attr('data-spool-type-option') || '';
        applyFilterState({
            spool_type: selectedType,
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        }, true);
    });

    // Update brand filter on text input change
    $brandFilter.on('input change', function () {
        updateDropdownOptions($brandDropdown, $brandFilter.val());
        applyFilterState({
            spool_type: readFilterStateFromControls().spool_type,
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        }, true);
    });

    // Update filament type filter on text input change
    $filamentTypeFilter.on('input change', function () {
        updateDropdownOptions($filamentTypeDropdown, $filamentTypeFilter.val());
        applyFilterState({
            spool_type: readFilterStateFromControls().spool_type,
            brand: $brandFilter.val() || '',
            filament_type: $filamentTypeFilter.val() || ''
        }, true);
    });

    // Close dropdowns when clicking outside of them
    $(document).on('click', function (event) {
        if ($(event.target).closest('#spool-type-filter-container').length === 0) {
            closeAllDropdowns();
        }
    });

    // Update filter on page load
    updateFilterFromUrl();

    // Update filter on history change
    window.addEventListener('popstate', function () {
        updateFilterFromUrl();
    });
}
/* product detail gallery */
function productDetailGallery(confDetailSwitch) {
    $('.thumb:first').addClass('active');
    timer = setInterval(autoSwitch, confDetailSwitch);
    $(".thumb").click(function (e) {
        switchImage($(this));
        clearInterval(timer);
        timer = setInterval(autoSwitch, confDetailSwitch);
        e.preventDefault();
    }
    );
    $('#mainImage').hover(function () {
        clearInterval(timer);
    }, function () {
        timer = setInterval(autoSwitch, confDetailSwitch);
    });
    function autoSwitch() {
        var nextThumb = $('.thumb.active').closest('div').next('div').find('.thumb');
        if (nextThumb.length == 0) {
            nextThumb = $('.thumb:first');
        }
        switchImage(nextThumb);
    }
    function switchImage(thumb) {
        $('.thumb').removeClass('active');
        var bigUrl = thumb.attr('href');
        thumb.addClass('active');
        $('#mainImage img').attr('src', bigUrl);
    }
}
/* product detail sizes */
function productDetailSizes() {
    $('.sizes a').click(function (e) {
        e.preventDefault();
        $('.sizes a').removeClass('active');
        $('.size-input').prop('checked', false);
        $(this).addClass('active');
        $(this).next('input').prop('checked', true);
    });
}
$.fn.alignElementsSameHeight = function () {
    $('.same-height-row').each(function () {
        var maxHeight = 0;
        var children = $(this).find('.same-height');
        children.height('auto');
        if ($(window).width() > 768) {
            children.each(function () {
                if ($(this).innerHeight() > maxHeight) {
                    maxHeight = $(this).innerHeight();
                }
            });
            children.innerHeight(maxHeight);
        }
        maxHeight = 0;
        children = $(this).find('.same-height-always');
        children.height('auto');
        children.each(function () {
            if ($(this).height() > maxHeight) {
                maxHeight = $(this).innerHeight();
            }
        });
        children.innerHeight(maxHeight);
    });
}
$(window).load(function () {
    windowWidth = $(window).width();
    $(this).alignElementsSameHeight();
});
$(window).resize(function () {
    newWindowWidth = $(window).width();
    if (windowWidth !== newWindowWidth) {
        setTimeout(function () {
            $(this).alignElementsSameHeight();
        }, 205);
        windowWidth = newWindowWidth;
    }
});