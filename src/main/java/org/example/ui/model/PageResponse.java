package org.example.ui.model;

import java.util.List;

public record PageResponse<T>(List<T> items, long total, int page, int size){}
